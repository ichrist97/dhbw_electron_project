// Jquery setup
window.$ = window.jQuery = require('jquery');

var mysql = require('mysql');

// Add the credentials to access your database
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: null,
    database: 'nebenkosten'
});

$(document).ready(() => {
    connection.connect((err) => {
        if (err) throw err;

        let query = `SELECT zählertyp.name,zählernummer,DATE_FORMAT(datum, "%e.%m.%Y") AS datum,verbrauch FROM zählerstand, zählertyp WHERE zählertyp_id = zählertyp.id`;
        console.log(query);

        connection.query(query, (err, result) => {
            if (err) {
                console.log("An error ocurred performing the query.");
                console.log(err);
                return;
            }

            Array.from(result).forEach((row) => {
                //console.log(`ID: ${row.id}; Zählertyp: ${row.zählertyp_id}; Datum: ${row.datum}; Verbrauch: ${row.verbrauch}`);
                console.log(row)

                //load into table
                let zählertyp = row.name;
                let zählernummer = row.zählernummer;
                let datum = row.datum;
                let verbrauch = row.verbrauch;
                let entry = `<tr><td>${zählernummer}</td><td>${datum}</td><td>${verbrauch}</td></tr>`;

                switch (zählertyp) {
                    case "Wasser":
                        //$("#tbodyWasser").innerHTML += entry;
                        document.getElementById("tbodyWasser").innerHTML += entry;
                        break;
                    case "Gas":
                        $("#tbodyGas").innerHTML += entry;
                        break;
                    case "Strom":
                        $("#tbodyStrom").innerHTML += entry;
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