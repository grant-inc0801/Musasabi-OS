```json
{
  "name": "musasabi-os-installer",
  "version": "1.0.0",
  "description": "Windows installer for Musasabi OS",
  "main": "index.js",
  "scripts": {
    "build:desktop-app": "electron-builder build --win --x64",
    "package:windows": "electron-builder --win",
    "start": "electron ."
  },
  "build": {
    "appId": "com.musasabi.os",
    "win": {
      "target": "nsis"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    },
    "directories": {
      "output": "build"
    }
  },
  "dependencies": {
    "electron": "^25.3.0"
  },
  "devDependencies": {
    "electron-builder": "^24.6.0"
  }
}
```

```javascript
const path = require('path');
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const fs = require('fs');

let mainWindow;
const APP_DATA_PATH = path.join(app.getPath('appData'), 'MusasabiOS');
const SETTINGS_PATH = path.join(APP_DATA_PATH, 'settings.json');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile('index.html');
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

function initializeAppData() {
  if (!fs.existsSync(APP_DATA_PATH)) {
    fs.mkdirSync(APP_DATA_PATH, { recursive: true });
  }
  if (!fs.existsSync(SETTINGS_PATH)) {
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify({ autoLaunch: false }));
  }
}

app.on('ready', () => {
  createWindow();
  initializeAppData();
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('toggle-auto-launch', (event, autoLaunch) => {
  let settings = JSON.parse(fs.readFileSync(SETTINGS_PATH));
  settings.autoLaunch = autoLaunch;
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings));
});
```

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Musasabi OS Setup</title>
</head>
<body>
    <h1>Musasabi OS</h1>
    <button id="launch-btn">Launch Musasabi OS</button>
    <button id="toggle-autolaunch">Toggle Auto Launch</button>
    <script>
        const { ipcRenderer } = require('electron');
        const launchBtn = document.getElementById('launch-btn');
        const toggleAutoLaunchBtn = document.getElementById('toggle-autolaunch');

        launchBtn.onclick = () => {
            alert('Launching Musasabi OS...');
        };

        toggleAutoLaunchBtn.onclick = () => {
            ipcRenderer.send('toggle-auto-launch', !toggleAutoLaunchBtn.classList.contains('active'));
            toggleAutoLaunchBtn.classList.toggle('active');
            alert('Auto launch setting toggled.');
        };
    </script>
</body>
</html>
```