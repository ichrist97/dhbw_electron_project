const electron = require("electron");
const {
    ipcRenderer
} = electron;
const browserWindow = electron.remote.BrowserWindow;

//setup on load
window.onload = () => {
    //show selected tab
    let active = document.querySelector(".active");
    //tab style
    active.parentElement.style.borderBottom = "2pt";
    active.parentElement.style.borderBottomColor = "#4db6ac";
    active.parentElement.style.borderBottomStyle = "solid";
    //show tabContent
    let href = active.getAttribute("href").replace("#", "");
    document.getElementById(href).style.display = "block";
};


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

//show selected tab
let tabs = Array.from(document.getElementsByClassName("tab"));
tabs.forEach((element) => {
    element.addEventListener("click", () => {
        //remove style from all tabs
        tabs.forEach((tab) => {
            tab.style.borderBottom = 0;
        });

        //append style to selected tab
        element.style.borderBottom = "2pt";
        element.style.borderBottomColor = "#4db6ac";
        element.style.borderBottomStyle = "solid";

        //set all tabContents to display none
        Array.from(document.getElementsByClassName("tabContent")).forEach((tabContent) => {
            tabContent.style.display = "none";
        });

        //set selected tabContent to display
        let href = element.childNodes[0].getAttribute("href").replace("#", "");
        document.getElementById(href).style.display = "block";
    });
});