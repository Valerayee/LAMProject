const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');




if (require('electron-squirrel-startup')) {
  app.quit();
}





function getGenome(path) {

  const { readFileSync } = require('node:fs');

  var genome = readFileSync(path, 'utf-8');
  
  const nucleotides = ['a', 't', 'c', 'g', 'A', 'T', 'C', 'G'];

  genome = genome.replace(new RegExp(`[^${nucleotides.join('')}]`, 'g'), '');

  return genome;

}

function getInitialRequest() {

  const genome = getGenome(path.join(__dirname, 'genome.txt'));

  const request = {
      "COMPUTING": {
          "THREADS": 4,
          "DOUBLE_DIVERGENCE": 0.01,
          "DO_SKIP": false
      },
      "PRIMER_SEARCH": {
          "LENGTH_RANGE": [ 20, 25 ],
          "NA_PLUS": 0.05,
          "RMV_REPEAT_AMOUNT": 4,
          "GC_RANGE": [ 40.0, 60.0 ],
          "TM_RANGE": [ 55.0, 65.0 ]
      },
      "PRIMER_SORTING": {
          "POSITIONS": [ false, false, true, false, true, true],
          "DISTANCE_RANGE": [1, 10, 10, 25, 0, 30, 10, 25, 1, 10],
          "AMPLICON_RANGE": [ 120, 220 ],
          "LENGTH_MAX_DIFF": 3,
          "TM_MAX_DIFF": 2,
      },
      "DIMER": {
          "DIMER_END": 3
      },
      "GENOME": {
          "DO_PARTIAL": false,
          "START": 0,
          "END": 29902,
          "GENOME": genome
      }
  };

  return request;

}

function loadDLL() {

  var ffi = require('ffi-napi');

  const DLL = new ffi.Library(path.join(__dirname, 'LAMP_DLL.dll'), {
    "design_primers": [ "string", ["string"]]
  });

  return DLL;

}

function makeRequest(request) {

  const DLL = loadDLL();

  const result = DLL.design_primers(JSON.stringify(request));

  return JSON.parse(result);

}




const createWindow = () => {

  const start_with_second = false;

  if (start_with_second) {
    openResultWindow(makeRequest(getInitialRequest()));
  } else {
    openRequestWindow();
  }

};

function openRequestWindow() {

  const requestWindow = new BrowserWindow({
    width: 600,
    height: 200,
    maximizable: false,
    resizable: false,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  //requestWindow.webContents.openDevTools();

  requestWindow.loadFile(path.join(__dirname, 'request.html'));

}

function openResultWindow(request) {

  const resultWindow = new BrowserWindow({
    width: 700,
    height: 800,
    maximizable: false,
    resizable: false,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js'),
    }
  });

  resultWindow.loadFile(path.join(__dirname, 'result.html'));

  resultWindow.webContents.on('did-finish-load', () => {

    //resultWindow.webContents.openDevTools();
    
    resultWindow.webContents.send('get-data', request);
  
  });

}

function openSetWindow(set) {

  const setWindow = new BrowserWindow({
    width: 900,
    height: 600,
    maximizable: false,
    resizable: false,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  setWindow.loadFile(path.join(__dirname, 'set.html'));

  setWindow.webContents.on('did-finish-load', () => {

    //setWindow.webContents.openDevTools();
    
    setWindow.webContents.send('get-data', set);
  
  });

}




app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});



ipcMain.handle("read-genome", async (_, path) => { // Maybe async is not needed
  
  return getGenome(path);

})

ipcMain.handle("resize-window", (event, width, height) => {

  let browserWindow = BrowserWindow.fromWebContents(event.sender);

  browserWindow.setSize(width, height);
  browserWindow.center();

});

ipcMain.handle("LAMP", (event, request) => {

  const res = makeRequest(request);

  openResultWindow(res);

  BrowserWindow.fromWebContents(event.sender).close();

});

ipcMain.handle("console", (_, text) => {
  console.log(text);
});

ipcMain.handle("open-set", (_, set) => {
  openSetWindow(set);
});

ipcMain.handle("clipboard-copy", (_, str) => {
  
  const { clipboard } = require('electron');

  clipboard.writeText(str);

});