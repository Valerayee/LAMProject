const contextBridge = require('electron').contextBridge;
const ipcRenderer = require('electron').ipcRenderer;

contextBridge.exposeInMainWorld(
    'bridge', {
        getInitialData: (data) => {
            ipcRenderer.on('get-initial-data', data);
        }
    }
);

const api = {
    openSet: (set) => ipcRenderer.invoke("open-set", set)
}