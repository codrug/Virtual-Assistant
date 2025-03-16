// Electron 
const { app, BrowserWindow, ipcMain, desktopCapturer } = require('electron');
const fs = require('fs');
const path = require('path');

let mainWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    mainWindow.loadURL('http://localhost:5173/'); // Replace with your React dev server or build path
});

// Handle screenshot requests from renderer process
ipcMain.handle('take-screenshot', async () => {
    const sources = await desktopCapturer.getSources({ types: ['screen'] });

    for (const source of sources) {
        if (source.name === 'Entire Screen') {
            const screenshotPath = path.join(app.getPath('pictures'), `screenshot_${Date.now()}.png`);
            const screenshot = source.thumbnail.toPNG();

            // Save the screenshot
            fs.writeFileSync(screenshotPath, screenshot);
            return screenshotPath; 
        }
    }
});

const { ipcMain } = require('electron');
const { exec } = require('child_process');

ipcMain.handle('open-calculator', () => {
    exec('calc', (error) => {
        if (error) console.error('Error opening calculator:', error);
    });
});

ipcMain.handle('open-camera', () => {
    exec('start microsoft.windows.camera:', (error) => {
        if (error) console.error('Error opening camera:', error);
    });
});
