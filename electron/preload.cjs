const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('desktopMedia', {
  takePending: () => ipcRenderer.invoke('take-open-media'),
  onOpen: (callback) => ipcRenderer.on('open-media', callback),
  pick: () => ipcRenderer.invoke('pick-media')
});
