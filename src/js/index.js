const electron = require("electron");
const {
    ipcRenderer
} = electron;
const browserWindow = electron.remote.BrowserWindow;

// database
const mysql = require('mysql');
// Add the credentials to access your database
let connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: null,
    database: 'nebenkosten'
});

// Jquery setup
window.$ = window.jQuery = require('jquery');

// materialize setup
M.AutoInit();

$(document).ready(() => {
    //init materialize tabs
    $('.tabs').tabs({
        swipeable: true
    });
});

//Mapping of counter types to related foreign key id in database
const typeMap = new Map();
typeMap.set("Wasser", 1);
typeMap.set("Strom", 2);
typeMap.set("Strom", 3);

// open addEntry window
let btnCreateEntry = document.getElementById("btnCreateEntry");
btnCreateEntry.addEventListener("click", () => {
    ipcRenderer.send("openAddEntryWindow");
});

// create entry in table
ipcRenderer.on('entry:add', function (e, entry) {
    //create database entry
    let tableName = "zählerstand";
    let counterType = typeMap.get(entry.type);

    let paramName = ["zählernummer", "datum", "verbrauch", "zählertyp_id"];
    let values = [entry.counterNr, entry.date, entry.amount, counterType];

    insertDatabase(tableName, paramName, values);

    // get reference to wanted table
    let tbody;
    console.log(entry);
    if (entry.type === "Wasser") {
        tbody = document.getElementById("tbodyWasser");
    } else if (entry.type === "Strom") {
        tbody = document.getElementById("tbodyStrom");
    } else if (entry.type === "Gas") {
        tbody = document.getElementById("tbodyGas");
    } else {
        console.log("No tbody found");
    }

    // create table row
    let htmlString = "<tr><td>" + entry.counterNr + "</td><td>" + entry.date + "</td><td>" + entry.amount + "</td></tr>";
    tbody.innerHTML += htmlString;
});

//Insert entry into database
function insertDatabase(tableName, paramName, values) {
    let query = `INSERT INTO ${mysql.escape(tableName)} (${mysql.escape(paramName.join())}) VALUES (${mysql.escape(values.join())})`;
    console.log(query);

    connection.query(query, (err, result) => {
        if (err) {
            console.log("An error ocurred performing the query.");
            console.log(err);
            return;
        }
        console.log("Query succesfully executed");
    });
}