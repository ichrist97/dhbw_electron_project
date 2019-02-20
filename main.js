// Modules to control application life and create native browser window
const electron = require("electron");
const {
    app,
    BrowserWindow,
    Menu,
    ipcMain
} = electron;

// SET ENV
process.env.NODE_ENV = 'dev';

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

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });

    // Create menu bar
    const mainMenu = Menu.buildFromTemplate(createMenu());
    Menu.setApplicationMenu(mainMenu);
}

function createMenu() {
    let menuTemplate = [{
            label: "Datei",
            submenu: [{
                label: "Beenden",
                accelerator: "Ctrl+Q",
                click() {
                    app.quit();
                }
            }]
        },
        {
            label: "Hilfe",
            submenu: [{
                label: "Über",
                click() {
                    openAboutWindow();
                }
            }]
        }
    ];

    // Add developer tools option if in dev
    if (process.env.NODE_ENV !== 'production') {
        menuTemplate.push({
            label: 'Developer Tools',
            submenu: [{
                    role: 'reload'
                },
                {
                    label: 'Toggle DevTools',
                    accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                    click(item, focusedWindow) {
                        focusedWindow.toggleDevTools();
                    }
                }
            ]
        });
    }
    return menuTemplate;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
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
    addEntryWindow = null;
});

//catch addEntryWindow msg
ipcMain.on("openAddEntryWindow", (event) => {
    addEntryWindow = new BrowserWindow({
        width: 500,
        height: 400,
        title: 'Zählerstandeintrag erstellen...',
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

function openAboutWindow() {
    aboutWindow = new BrowserWindow({
        width: 500,
        height: 400,
        title: 'Über',
        parent: mainWindow,
        modal: true,
        show: false
    });

    aboutWindow.loadFile("src/html/about.html");
    aboutWindow.setMenu(null);
    aboutWindow.setResizable(false);

    //show
    aboutWindow.once("ready-to-show", () => {
        aboutWindow.show();
    });

    // Handle garbage collection
    aboutWindow.on('close', function () {
        aboutWindow = null;
    });
}