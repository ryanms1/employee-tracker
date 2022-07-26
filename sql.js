const inquirer = require('inquirer')
const db = require('./db/connection')
const cTable = require('console.table')
const prompt = require('./index')


const allDepts = () => {
    const sql = `SELECT * FROM departments`;

    db.query(sql, (err, rows) => {
        if (err) {
            console.log('error');
        }
        console.table(rows);
    });
}

const allRoles = () => {
    const sql = `SELECT roles.id, roles.title, roles.salary, departments.name AS department
                FROM roles
                LEFT JOIN departments ON department_id = departments.id
                ORDER BY departments.id`;

    db.query(sql, (err, rows) => {
        if (err) {
            console.log('error');
        }
        console.table(rows);
    });
}

const allEmp = () => {
    const sql = `SELECT employees.id, employees.first_name, employees.last_name, employees.manager_id, 
                roles.salary AS salary, 
                roles.title AS role,
                departments.name AS department
                FROM employees
                LEFT JOIN roles ON employees.role_id = roles.id
                LEFT JOIN departments ON roles.department_id = departments.id
                ORDER BY departments.id`;

    db.query(sql, (err, rows) => {
        if (err) {
            console.log('error');
        }
        console.table(rows);
    });
}

const addDept = () => {
    return inquirer.prompt([
        {
            type: 'input',
            name: 'newDept',
            message: 'What is the name of the Department you would like to add?',
            validate: deptInput => {
                if (deptInput) {
                    return true;
                } else {
                    console.log("The department's name is required.")
                    return false
                }
            }
        }
    ]).then(deptInfo => {
        const { newDept } = deptInfo

        const sql = `INSERT INTO departments (name)
                    VALUES ('${newDept}')`
        db.query(sql, (err, row) => {
            if (err) {
                console.log('error')
            }
            allDepts()
        })
    })
}


let departmentArr = []
const getDepartments = () => {
    const sql = `SELECT name FROM departments`

    db.query(sql, (err, rows) => {
        if (err) {
            console.log('error')
        }
        departmentArr = rows.map(department => { return Object.values(department) }).flat()
    })
    return departmentArr
}
departmentArr = getDepartments()

const addRole = () => {
    return inquirer.prompt([
        {
            type: 'input',
            name: 'title',
            message: 'What is the name of the role you would like to add?',
            validate: roleInput => {
                if (roleInput) {
                    return true;
                } else {
                    console.log("The role's name is required.")
                    return false
                }
            }
        },
        {
            type: 'input',
            name: 'salary',
            message: "Please enter the salary for this position.(ex. 150000)",
            validate: salaryInput => {
                if (isNaN(salaryInput) || !salaryInput) {
                    console.log("The salary for this position is required.")
                    return false;
                } else {
                    return true
                }
            }
        },
        {
            type: 'list',
            name: 'department',
            message: 'Which department does this role fall under?',
            choices: departmentArr
        }
    ]).then(roleInfo => {
        const { title, salary, department } = roleInfo

        const sql = `INSERT INTO roles (title, salary, department_id)
                    VALUES 
                    ('${title}', '${salary}', (SELECT id FROM departments WHERE name = '${department}'))`

        db.query(sql, (err, row) => {
            if (err) {
                console.log('error')
            }
            allRoles()
        })
    })
}

let rolesArr = []
const getRoles = () => {
    const sql = `SELECT title FROM roles`
    db.query(sql, (err, rows) => {
        if (err) {
            console.log('error')
        }
        rolesArr = rows.map(title => { return Object.values(title) }).flat()
    })
    return rolesArr
}
rolesArr = getRoles()

let managerArr = []
const getManagers = () => {
    const sql = `SELECT first_name, last_name FROM employees WHERE manager_id IS NULL`
    db.query(sql, (err, rows) => {
        if (err) {
            console.log(err)
        }
        managerArr = rows.map(manager => { return (Object.values(manager.first_name) + ' ' + Object.values(manager.last_name)).replace(/,/g, "") })
        managerArr.push('none')
    })
    return managerArr
}
managerArr = getManagers()

const addEmp = () => {

    // console.log(rolesArr)

    return inquirer.prompt([
        {
            type: 'input',
            name: 'fName',
            message: "What is the employee's FIRST name?",
            validate: fnInput => {
                if (fnInput) {
                    return true;
                } else {
                    console.log("The employee's FIRST name is required.")
                    return false
                }
            }
        },
        {
            type: 'input',
            name: 'lName',
            message: "What is the employee's LAST name?",
            validate: lnInput => {
                if (lnInput) {
                    return true;
                } else {
                    console.log("The employee's LAST name is required.")
                    return false
                }
            }
        },
        {
            type: 'list',
            name: 'role',
            message: "Please select the employee's role.",
            choices: rolesArr
        },
        {
            type: 'list',
            name: 'manager',
            message: "Please select the manager they will work under.",
            choices: managerArr
        }
    ]).then(newEmp => {
        const { fName, lName, role, manager } = newEmp

        if (manager === 'none') {
            const sql2 = `INSERT INTO employees (first_name, last_name, role_id, manager_id) 
            VALUES ('${fName}', '${lName}', (SELECT id FROM roles WHERE title = '${role}'), null)`

            db.query(sql2, (err, row) => {
                if (err) {
                    console.log('error')
                }
                allEmp()
            })
        } else {

            const firstName = manager.split(' ')[0];
            const lastName = manager.split(' ')[1];

            const sql1 = `SELECT id FROM employees WHERE first_name = '${firstName}' AND last_name = '${lastName}'`
            db.promise().query(sql1).then((rows) => {
                const managerID = rows[0][0].id
                return managerID
            }).then(managerID => {

                const sql2 = `INSERT INTO employees (first_name, last_name, role_id, manager_id) 
                VALUES ('${fName}', '${lName}', (SELECT id FROM roles WHERE title = '${role}'), ${managerID})`

                db.query(sql2, (err, row) => {
                    if (err) {
                        console.log('error')
                    }
                    allEmp()
                })
            })
        }

    })
}
let empArr = []
const getEmp = () => {
    const sql = `SELECT first_name, last_name FROM employees`
    db.query(sql, (err, rows) => {
        if (err) {
            console.log(err)
        }
        empArr = rows.map(employee => { return (Object.values(employee.first_name) + ' ' + Object.values(employee.last_name)).replace(/,/g, "") })
    })
    return empArr
}

empArr = getEmp()

const updateRole = () => {
    return inquirer.prompt([
        {
            type: 'list',
            name: 'employee',
            message: "Which employee's role is being updated?",
            choices: empArr
        },
        {
            type: 'list',
            name: 'role',
            message: 'Which role is the employee undertaking',
            choices: rolesArr
        }
    ]).then(newRole => {
        const { employee, role } = newRole

        const first = employee.split(' ')[0]
        const last = employee.split(' ')[1]

        const sql = `UPDATE employees SET role_id = (SELECT id FROM roles WHERE title = '${role}') 
                    WHERE first_name = '${first}' AND last_name = '${last}'`

        db.query(sql, (err, row) => {
            if (err) {
                console.log('error')
            }
            allEmp()
        })
    })
}


module.exports = { allDepts, allRoles, allEmp, addEmp, addDept, addRole, updateRole }