import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
	getAppVersion: () => ipcRenderer.invoke('get-app-version'),
	platform: process.platform,
});

contextBridge.exposeInMainWorld('windowServices', {
	createWindow: (windowName: string, options: any) => {
		console.log('[electron] requested window creation', windowName, options);
		ipcRenderer.send('create-window', windowName, options);
	},
});
