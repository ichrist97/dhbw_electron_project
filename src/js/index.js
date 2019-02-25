const electron = require("electron");
const {
    ipcRenderer
} = electron;
const browserWindow = electron.remote.BrowserWindow;

// Jquery setup
window.$ = window.jQuery = require('jquery');

/*
//loading screen
function onReady(callback) {
    var intervalId = window.setInterval(function () {
        if (document.getElementsByTagName('body')[0] !== undefined) {
            window.clearInterval(intervalId);
            callback.call(this);
        }
    }, 1000);
}

function setVisible(selector, visible) {
    document.querySelector(selector).style.display = visible ? 'block' : 'none';
}

onReady(function () {
    setVisible('.page', true);
    setVisible('#loading', false);
});
*/

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
        format: "dd.mm.yyyy"
    });
});

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
    unfoldCollapsible("#finanzen");
});
$("#unfoldAllCollapsibleTable").on("click", () => {
    unfoldCollapsible("#data");
});
$("#unfoldAllCollapsibleContract").on("click", () => {
    unfoldCollapsible("#vertrag");
});
//close all collapsible
$("#closeAllCollapsibleFinance").on("click", () => {
    closeCollapsible("#finanzen");
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

//tab verträge btnCreateContract
$("#btnCreateContract").on("click", () => {
    console.log("add contract")
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
    console.log("modal closed")
    //clear inputs
    let inputs = document.getElementById("modalAddEntry").querySelectorAll("input");
    Array.from(inputs).forEach((element) => {
        element.value = "";
    });
    //clear select
    document.getElementById("modalAddEntry").querySelector("select").selectedIndex = 0;
});

//brauchwasser calculation
$("#preisBrauchwasser").on("change", () => {
    //Dummy; must be substituted with values from database
    let waterVolume = 100;
    let days = 200;

    //calc statistics
    $("#tageSeit").val(days);
    $("#tageBis").val(365 - days);
    $("#avgVerbrauch").val(waterVolume / days);

    //calc final price
    let price = $("#preisBrauchwasser").val();
    $("#brauchwasserGebühr").text(waterVolume * price + "€");
});

//clear all inputs in finanzstatus
$("#resetForm").on("click", () => {
    let inputs = document.querySelector("#finanzen").getElementsByTagName("input");
    Array.from(inputs).forEach((element) => {
        element.value = "";
    });

    let gebühren = document.querySelector("#finanzen").querySelectorAll(".gebühr");
    Array.from(gebühren).forEach((element) => {
        element.innerHTML = "";
    });
});