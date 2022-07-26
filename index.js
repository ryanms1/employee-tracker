const inquirer = require('inquirer');
const cTable = require('console.table');

const { allDepts, allRoles, allEmp, addEmp, addDept, addRole, updateRole } = require('./sql')

const promptUser = () => {
    return inquirer.prompt([
        {
            type: 'list',
            name: 'option',
            message: 'What would you like to do?',
            choices: [
                'View all departments',
                'View all roles',
                'View all employees',
                'Add a department',
                'Add an employee',
                'Add a role',
                "Update an employee's role"
            ]
        }
    ])
        .then(answer => {
            switch (answer.option) {
                case 'View all departments':
                    allDepts();
                    break;
                case 'View all roles':
                    allRoles();
                    break;
                case 'View all employees':
                    allEmp();
                    break;
                case 'Add a department':
                    addDept();
                    break;
                case 'Add an employee':
                    addEmp();
                    break;
                case 'Add a role':
                    addRole();
                    break;
                case "Update an employee's role":
                    updateRole();
                    break;
            }
        });
}

promptUser();

module.exports = promptUser