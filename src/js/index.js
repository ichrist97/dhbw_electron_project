const electron = require("electron");
const {
    ipcRenderer
} = electron;
const browserWindow = electron.remote.BrowserWindow;

// Jquery setup
window.$ = window.jQuery = require('jquery');

$(document).ready(() => {
    initInputStyle();

    //init collapsible
    let elemsCollapsible = document.querySelectorAll('.collapsible.expandable');
    let instanceCollapsible = M.Collapsible.init(elemsCollapsible, {
        accordion: false
    });

    //init tabs
    let elemsTabs = document.querySelectorAll(".tabs");
    let instanceTabs = M.Tabs.init(elemsTabs, {
        swipeable: false
    });

    //init fixed action button
    let elemsFixedBtn = document.querySelectorAll('.fixed-action-btn');
    let instanceFixedBtn = M.FloatingActionButton.init(elemsFixedBtn, {});

    //init modal
    let elemsModal = document.querySelectorAll('.modal');
    let instanceModal = M.Modal.init(elemsModal, {});

    //init select
    var elemsSelect = document.querySelectorAll('select');
    var instanceSelect = M.FormSelect.init(elemsSelect, {});

    //init datepicker
    var elemsDatepicker = document.querySelectorAll('.datepicker');
    var instanceDatepicker = M.Datepicker.init(elemsDatepicker, {
        format: "dd.mm.yyyy",
        i18n: {
            cancel: "Abbrechen",
            clear: "Löschen",
            done: "Ok",
            previousMonth: "<",
            nextMonth: ">",
            months: [
                'Januar',
                'Februar',
                'März',
                'April',
                'Mai',
                'Juni',
                'Juli',
                'August',
                'September',
                'Oktober',
                'November',
                'Dezember'
            ],
            monthsShort: [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'Mai',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Okt',
                'Nov',
                'Dez'
            ],
            weekDays: [
                'Sonntag',
                'Montag',
                'Dienstag',
                'Mittwoch',
                'Donnerstag',
                'Freitag',
                'Samstag'
            ],
            weekdaysShort: [
                'So',
                'Mo',
                'Di',
                'Mi',
                'Do',
                'Fri',
                'Sa'
            ],
            weekdaysAbbrev: ['S', 'M', 'D', 'M', 'D', 'F', 'S']
        }
    });
});

//Mapping of counter types to related foreign key id in database
const typeMap = new Map();
typeMap.set("Wasser", 1);
typeMap.set("Strom", 2);
typeMap.set("Strom", 3);

function addTableEntry() {
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

//unfold all collapsible
$("#unfoldAllCollapsibleFinance").on("click", () => {
    let isBlurred = $("#finanzenMain").hasClass("blur");
    if (!isBlurred) {
        unfoldCollapsible("#finanzen");
    }
});
$("#unfoldAllCollapsibleTable").on("click", () => {
    unfoldCollapsible("#data");
});
$("#unfoldAllCollapsibleContract").on("click", () => {
    unfoldCollapsible("#vertrag");
});
//close all collapsible
$("#closeAllCollapsibleFinance").on("click", () => {
    let isBlurred = $("#finanzenMain").hasClass("blur");
    if (!isBlurred) {
        closeCollapsible("#finanzen");
    }
});
$("#closeAllCollapsibleTable").on("click", () => {
    closeCollapsible("#data");
});
$("#closeAllCollapsibleContract").on("click", () => {
    closeCollapsible("#vertrag");
});

function unfoldCollapsible(tabTargetId) {
    Array.from(document.querySelector(tabTargetId).getElementsByClassName("collapsible-header")).forEach((element) => {
        let isOpen = collapsibleState.get(element);
        if (!isOpen) {
            //trigger click event for related header to open body and change icon
            element.click();
        }
    });
}

function closeCollapsible(tabTargetId) {
    Array.from(document.querySelector(tabTargetId).getElementsByClassName("collapsible-header")).forEach((element) => {
        let isOpen = collapsibleState.get(element);
        if (isOpen) {
            //trigger click event for related header to open body and change icon
            element.click();
        }
    });
}

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

//change icon of collapse header when closing or opening the header
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

//change the unit of measure according to the selected type in the addEntryModal
$("#type").on("change", (event) => {
    let value = event.target.options[event.target.selectedIndex].value;
    if (value === "Wasser" || value === "Gas") {
        document.getElementById("verbrauchLabel").innerText = "Verbrauch [m³]";
    } else if (value === "Strom") {
        document.getElementById("verbrauchLabel").innerText = "Verbrauch [kWh]";
    }
});

//clear modalAddEntry when closing it
$("#closeModalEntry").on("click", () => {
    //clear inputs
    let inputs = document.getElementById("modalAddEntry").querySelectorAll("input");
    Array.from(inputs).forEach((element) => {
        element.value = "";
    });
    //clear select
    document.getElementById("modalAddEntry").querySelector("select").selectedIndex = 0;
});