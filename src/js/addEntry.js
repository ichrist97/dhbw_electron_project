const electron = require('electron');
const {
    ipcRenderer
} = electron;

// Jquery setup
window.$ = window.jQuery = require('jquery');

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