const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    title: "Sử Án - Chronos Attorney Engine",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Always load the built file, because this app is meant to be a packaged executable
  const indexPath = path.join(__dirname, '../dist/index.html');
  console.log("Loading path:", indexPath);
  win.loadFile(indexPath);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
