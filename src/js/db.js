// Jquery setup
window.$ = window.jQuery = require('jquery');

var mysql = require('mysql');

// Add the credentials to access your database
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: null,
    database: 'test'
});

$(document).ready(() => {
    connection.connect((err) => {
        if (err) throw err;

        let query = `SELECT * FROM user`;
        console.log(query);

        connection.query(query, (err, result) => {
            if (err) {
                console.log("An error ocurred performing the query.");
                console.log(err);
                return;
            }

            Array.from(result).forEach((row) => {
                console.log(row);
            });
        });

        connection.end(() => {
            console.log("Connection closed");
        });
    });
});

function addEntry(tableName, paramName, values) {
    connection.connect((err) => {
        if (err) throw err;

        let query = `INSERT INTO ${tableName} (${paramName[0]},${paramName[1]}) VALUES (${values[0]}, ${values[1]})`;
        console.log(query);

        connection.query(query, (err, result) => {
            if (err) {
                console.log("An error ocurred performing the query.");
                console.log(err);
                return;
            }
            console.log("Query succesfully executed");
        });

        connection.end(() => {
            console.log("Connection closed");
        });
    });
}