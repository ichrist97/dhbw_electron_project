const electron = require('electron');
const {
    ipcRenderer
} = electron;

// Jquery setup
window.$ = window.jQuery = require('jquery');

const mysql = require('mysql');

document.addEventListener('DOMContentLoaded', () => {
    console.log("init materialize")
    //datepicker
    let elemsDatepicker = document.querySelectorAll('datepicker');
    let instanceDatepicker = M.FormSelect.init(elemsDatepicker, {
        format: "dd-mm-yyyy"
    });

    //select
    let elemsSelect = document.querySelectorAll('select');
    let instanceSelect = M.FormSelect.init(elemsSelect, {});

});

$(document).ready(() => {
    console.log("ready")
    //init materialize


    /*
    //init datepicker
    $('.datepicker').datepicker({
        format: "dd-mm-yyyy"
    });

    //init select
    $('select').formSelect();
    */
});

// submit form
let btnSubmit = document.getElementById("btnSubmit");
btnSubmit.addEventListener("click", (e) => {
    e.preventDefault();

    const entry = {
        type: document.getElementById("type").value,
        date: document.getElementById("datum").value,
        amount: document.getElementById("verbrauch").value,
        counterNr: document.getElementById("zählernummer").value
    };
    ipcRenderer.send("entry:add", entry);
});