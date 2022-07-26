const mysql = require('mysql2')

//connect to mysql database
const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'employeetracker_db'
    },
    console.log('Connected to the employee tracker database')
)

module.exports = db