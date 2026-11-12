const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
let win;
let pending = [];
const mediaExt = /\.(mp4|mkv|avi|mov|wmv|webm|m4v|mpeg|mpg|ts|mp3|m4a|wav|flac|ogg)$/i;
function collect(argv) { const files = argv.filter(x => typeof x === 'string' && mediaExt.test(x) && fs.existsSync(x)); pending.push(...files); }
function createWindow() {
  win = new BrowserWindow({width:1200,height:800,minWidth:760,minHeight:560,backgroundColor:'#080808',title:'Skeletor Video',icon:path.join(__dirname,'../www/assets/icon.png'),webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true}});
  win.loadFile(path.join(__dirname,'../www/index.html'));
  win.webContents.on('did-finish-load',()=>{if(pending.length){win.webContents.send('open-media');}});
}
app.whenReady().then(()=>{collect(process.argv.slice(1));createWindow();app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)createWindow()});});
app.on('open-file',(event,file)=>{event.preventDefault();pending.push(file);if(win)win.webContents.send('open-media');});
app.on('second-instance',(event,argv)=>{collect(argv.slice(1));if(win){if(win.isMinimized())win.restore();win.focus();win.webContents.send('open-media');}});
ipcMain.handle('take-open-media',async()=>{const files=pending.splice(0);const out=[];for(const file of files){try{const b=fs.readFileSync(file);out.push({name:path.basename(file),type:({'.mp4':'video/mp4','.mkv':'video/x-matroska','.webm':'video/webm','.mov':'video/quicktime','.mp3':'audio/mpeg','.m4a':'audio/mp4','.wav':'audio/wav','.flac':'audio/flac','.ogg':'audio/ogg'})[path.extname(file).toLowerCase()]||'application/octet-stream',data:new Uint8Array(b)});}catch(e){}}
return out;});
ipcMain.handle('pick-media',async()=>{const r=await dialog.showOpenDialog({properties:['openFile','multiSelections'],filters:[{name:'Media',extensions:['mp4','mkv','avi','mov','wmv','webm','m4v','mpeg','mpg','ts','mp3','m4a','wav','flac','ogg']}]});return r.canceled?[]:r.filePaths;});
