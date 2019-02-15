const electron = require('electron');
const {
    ipcRenderer
} = electron;

// submit form
let btnSubmit = document.getElementById("btnSubmit");
btnSubmit.addEventListener("click", (e) => {
    e.preventDefault();

    const entry = {
        type: document.getElementById("type").value,
        date: document.getElementById("datum").value,
        amount: document.getElementById("verbrauch").value,
        price: document.getElementById("preis").value
    };
    ipcRenderer.send("entry:add", entry);
});