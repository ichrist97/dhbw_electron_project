const electron = require("electron");
const {
    ipcRenderer
} = electron;
const browserWindow = electron.remote.BrowserWindow;

// open addEntry window
let btnCreateEntry = document.getElementById("btnCreateEntry");
btnCreateEntry.addEventListener("click", () => {
    ipcRenderer.send("openAddEntryWindow");
});

// create entry in table
ipcRenderer.on('entry:add', function (e, entry) {
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
    let htmlString = "<tr><td>" + entry.date + "</td><td>" + entry.amount + "</td><td>" + entry.price + "</td></tr>";
    tbody.innerHTML += htmlString;
});

/*
ipcRenderer.on('item:clear', function () {
    ul.className = '';
    ul.innerHTML = '';
});
*/