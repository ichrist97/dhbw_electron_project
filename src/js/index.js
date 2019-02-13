const electron = require("electron");
const path = require("path");
const {
    ipcRenderer
} = electron;
const browserWindow = electron.remote.BrowserWindow;

// open addEntry window
let btnCreateEntry = document.getElementById("btnCreateEntry");
btnCreateEntry.addEventListener("click", () => {
    addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: 'Add Shopping List Item'
    });
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addWindow.html'),
        protocol: 'file:',
        slashes: true
    }));
    // Handle garbage collection
    addWindow.on('close', function () {
        addWindow = null;
    });
});

// create entry in table
ipcRenderer.on('entry:add', function (e, entry) {
    // get reference to wanted table
    let tbody;
    if (entry.type === "Wasser") {
        tbody = document.getElementById("tbodyWasser");
    } else if (entry.type === "Strom") {
        tbody = document.getElementById("tbodyStrom");
    } else if (entry.type === "Gas") {
        tbody = document.getElementById("tbodyGas");
    }

    // create table row
    tbody.innerHTML += "<tr>";
    tbody.innerHTML += "<td>" + entry.date + "</td>";
    tbody.innerHTML += "<td>" + entry.amount + "</td>";
    tbody.innerHTML += "<td>" + entry.price + "</td>";
    tbody.innerHTML += "</tr>";
});

/*
ipcRenderer.on('item:clear', function () {
    ul.className = '';
    ul.innerHTML = '';
});
*/