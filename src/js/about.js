// Jquery setup
window.$ = window.jQuery = require('jquery');

const electron = require("electron");
const {
    ipcRenderer
} = electron;

$("#btnClose").on("click", () => {
    ipcRenderer.send("closeAbout");
});