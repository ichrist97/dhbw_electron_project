//handle setupevents as quickly as possible
const setupEvents = require('./installers/setupEvents');
if (setupEvents.handleSquirrelEvent()) {
    // squirrel event handled and app will exit in 1000ms, so don't do anything else
    return;
}

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
let splashWindow;

function createMainWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        icon: __dirname + "/assets/icons/png/icon48.png",
        webPreferences: {
            nodeIntegration: true
        },
        show: false
    });

    // and load the index.html of the app.
    mainWindow.loadFile('src/html/index.html');

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });

    mainWindow.once("ready-to-show", () => {
        setTimeout(() => {
            splashWindow.destroy();
            splashWindow = null;
            mainWindow.show();
            mainWindow.maximize();
        }, 2000);
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

function createSplashWindow() {
    // Create the browser window.
    splashWindow = new BrowserWindow({
        width: 600,
        height: 550,
        icon: __dirname + "/assets/icons/png/icon48.png",
        frame: false,
        webPreferences: {
            nodeIntegration: false
        },
        show: false
    });

    // and load the index.html of the app.
    splashWindow.loadFile('src/html/splash.html');

    splashWindow.once("ready-to-show", () => {
        splashWindow.show();
    });

    // Emitted when the window is closed.
    splashWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        splashWindow = null;
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    createSplashWindow();
    createMainWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createMainWindow();
    }
});

function openAboutWindow() {
    aboutWindow = new BrowserWindow({
        width: 480,
        height: 480,
        title: 'Über',
        parent: mainWindow,
        modal: true,
        show: false,
        frame: false
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

// Close about window
ipcMain.on("closeAbout", (event) => {
    aboutWindow.destroy();
    aboutWindow = null;
});