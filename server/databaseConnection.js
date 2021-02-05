const mysql = require('mysql');

const con = mysql.createConnection({
    host : 'localhost', 
    user : 'root', 
    database : 'Employee',
    password : 'password'
});

module.exports = con