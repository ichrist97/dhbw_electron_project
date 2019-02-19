// Jquery setup
window.$ = window.jQuery = require('jquery');

const mysql = require('mysql');

// Add the credentials to access your database
let connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: null,
    database: 'nebenkosten'
});

$(document).ready(() => {
    loadExistingData();
});

function addEntry(tableName, paramName, values) {
    connection.connect((err) => {
        if (err) throw err;

        let query = `INSERT INTO ${tableName} (${paramName.join()}) VALUES (${values.join()})`;
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

function loadExistingData() {
    connection.connect((err) => {
        if (err) throw err;

        let selectArgs = ["zählertyp.name", "zählernummer", "DATE_FORMAT(datum, \"%e.%m.%Y\") AS datum", "verbrauch"];
        let fromArgs = ["zählerstand, zählertyp"];
        let whereArgs = ["zählertyp_id = zählertyp.id"];

        let query = `SELECT ${selectArgs.join()} FROM ${fromArgs.join()} WHERE ${whereArgs}`;
        console.log(query);

        connection.query(query, (err, result) => {
            if (err) {
                console.log("An error ocurred performing the query.");
                console.log(err);
                return;
            }

            Array.from(result).forEach((row) => {
                //load into table
                let zählertyp = row.name;
                let zählernummer = row.zählernummer;
                let datum = row.datum;
                let verbrauch = row.verbrauch;
                let entry = `<tr><td>${zählernummer}</td><td>${datum}</td><td>${verbrauch}</td></tr>`;

                switch (zählertyp) {
                    case "Wasser":
                        $("#tbodyWasser").append(entry);
                        break;
                    case "Gas":
                        $("#tbodyGas").append(entry);
                        break;
                    case "Strom":
                        $("#tbodyStrom").append(entry);
                        break;
                    default:
                        console.log("Unknown zählertyp");
                        break;
                }
            });
        });

        connection.end(() => {
            console.log("Connection closed");
        });
    });
}