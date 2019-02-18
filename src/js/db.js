var mysql = require('mysql');

// Add the credentials to access your database
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: null, // or the original password : 'apaswword'
    database: 'test'
});

// connect to mysql
/*
connection.connect(function (err) {
    // in case of error
    if (err) {
        console.log(err.code);
        console.log(err.fatal);
    } else {
        console.log("Connected to DB");
    }
});
*/

// Perform a query
/*
$query = 'SELECT * FROM `test_table`';
connection.query($query, function (err, rows, fields) {
    if (err) {
        console.log("An error ocurred performing the query.");
        console.log(err);
        return;
    }

    console.log("Query succesfully executed", rows);
});
*/

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