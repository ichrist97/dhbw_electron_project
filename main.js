// Modules to control application life and create native browser window
const electron = require("electron");
const {
    app,
    BrowserWindow,
    Menu,
    ipcMain
} = electron;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let aboutWindow;
let addEntryWindow;

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    });
    mainWindow.maximize();

    // and load the index.html of the app.
    mainWindow.loadFile('src/html/index.html');

    // Open the DevTools on start
    mainWindow.webContents.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    });

    // Create menu bar
    const mainMenu = Menu.buildFromTemplate([{
            label: "File",
            submenu: [{
                label: "Exit",
                accelerator: "Ctrl+Q",
                click() {
                    app.quit();
                }
            }]
        },
        {
            label: "Help",
            submenu: [{
                label: "About"
            }]
        }
    ]);
    Menu.setApplicationMenu(mainMenu);

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

// Catch entry:add msg
ipcMain.on("entry:add", function (event, entry) {
    mainWindow.webContents.send("entry:add", entry);
    addEntryWindow.close();
    // Still have a reference to addWindow in memory. Need to reclaim memory (Garbage collection)
    addWindow = null;
});

//catch addEntryWindow msg
ipcMain.on("openAddEntryWindow", (event) => {
    addEntryWindow = new BrowserWindow({
        width: 500,
        height: 400,
        title: 'Add Entry',
        parent: mainWindow,
        modal: true,
        show: false
    });
    addEntryWindow.setMenu(null);
    addEntryWindow.isResizable(false);

    addEntryWindow.loadFile("src/html/addEntry.html");

    //show
    addEntryWindow.once("ready-to-show", () => {
        addEntryWindow.show();
    });

    // Handle garbage collection
    addEntryWindow.on('close', function () {
        addEntryWindow = null;
    });
});