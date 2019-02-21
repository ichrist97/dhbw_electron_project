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

$(document).ready(() => {
    initInputStyle();

    //collapsible
    let elemsCollapsible = document.querySelectorAll('.collapsible.expandable');
    let instanceCollapsible = M.Collapsible.init(elemsCollapsible, {
        accordion: false
    });

    //tabs
    let elemsTabs = document.querySelectorAll(".tabs");
    let instanceTabs = M.Tabs.init(elemsTabs, {
        swipeable: false
    });

    //fixed action button
    let elemsFixedBtn = document.querySelectorAll('.fixed-action-btn');
    let instanceFixedBtn = M.FloatingActionButton.init(elemsFixedBtn, {});
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
    let editBtn = `<button class="btn-small waves-effect waves-light teal lighten-2">
                        <i class="material-icons">mode_edit</i>
                    </button>`;

    let htmlString = `<tr><td>${entry.counterNr}</td><td>${entry.date}</td><td>${entry.amount}</td><td>${editBtn}</td></tr>`;
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

function initInputStyle() {
    //change style of all readonly inputs to seperate them visually from the normal inputs
    let inputs = document.getElementsByClassName("input-readonly");
    Array.from(inputs).forEach((element) => {
        element.style.border = "1pt";
        element.style.borderColor = "#e0e0e0";
        element.style.borderStyle = "solid";
        element.style.backgroundColor = "#fafafa";
    });
}

//fixed action button events
/*
 * the state of the collapsed bodies (open/closed) get stored in this map as a workaround
 * the state cannot be retrieved otherwise
 * the state is used as check for consistent icon changing of the body
 */
let collapsibleState = new Map(); //[Key: HTML Node, Value: Boolean]; Open: True; Closed: False
Array.from(document.getElementsByClassName("collapsible-header")).forEach((element) => {
    collapsibleState.set(element, false);
});
console.log(collapsibleState);

//unfold all collapsible
$("#unfoldAllCollapse").on("click", () => {
    let instance = M.Collapsible.getInstance($('.collapsible.expandable'));
    //instance.open();
    Array.from(document.getElementsByClassName("collapsible-header")).forEach((element) => {
        let isOpen = collapsibleState.get(element);
        if (!isOpen) {
            //trigger click event for related header to open body and change icon
            element.click();
        }
    });
});
//close all collapsible
$("#closeAllCollapse").on("click", () => {
    let instance = M.Collapsible.getInstance($('.collapsible.expandable'));
    Array.from(document.getElementsByClassName("collapsible-header")).forEach((element) => {
        let isOpen = collapsibleState.get(element);
        if (isOpen) {
            //trigger click event for related header to open body and change icon
            element.click();
        }
    });
});

//change icon of collapsible when opening or closing
Array.from(document.getElementsByClassName("collapsible-header")).forEach((element) => {
    element.addEventListener("click", (event) => {
        //change state
        let state = collapsibleState.get(element);
        collapsibleState.set(element, !state);
        //set icon
        changeCollapseHeaderIcon(element);
    });
});

function changeCollapseHeaderIcon(element) {
    let icons = element.getElementsByTagName("i");
    Array.from(icons).forEach((icon) => {
        let innerText = icon.innerText;
        if (innerText === "keyboard_arrow_down") { //from closed to opened
            icon.innerText = "keyboard_arrow_up";
        } else if (innerText === "keyboard_arrow_up") { //from opened to closed
            icon.innerText = "keyboard_arrow_down";
        }
    });
}