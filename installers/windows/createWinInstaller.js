const createWindowsInstaller = require('electron-winstaller').createWindowsInstaller;
const path = require('path');

getInstallerConfig()
    .then(createWindowsInstaller)
    .catch((error) => {
        console.error(error.message || error);
        process.exit(1);
    });

function getInstallerConfig() {
    console.log('creating windows installer');
    const rootPath = path.join('./');
    const outPath = path.join(rootPath, 'release-builds');

    return Promise.resolve({
        appDirectory: path.join(outPath, 'dhbw_electron_project/'),
        authors: 'Ivo Christ',
        noMsi: true,
        outputDirectory: path.join(outPath, 'windows-installer'),
        exe: 'dhbw_electron_project.exe',
        setupExe: 'UtilityManager-Installer.exe',
        setupIcon: path.join(rootPath, 'assets', 'icons', 'win', 'icon48.ico')
    });
}