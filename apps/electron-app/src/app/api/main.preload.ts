import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
	getAppVersion: () => ipcRenderer.invoke('get-app-version'),
	platform: process.platform,
});

contextBridge.exposeInMainWorld('windowServices', {
	getCurrentWindowName: () => {
		console.log('[electron] requested current window name');
		return ipcRenderer.invoke('get-current-window-name');
	},
	createWindow: (windowName: string, options: any) => {
		console.log('[electron] requested window creation', windowName, options);
		ipcRenderer.send('create-window', windowName, options);
	},
	closeWindow: (windowName: string, options: any) => {
		console.log('[electron] requested window close', windowName, options);
		ipcRenderer.send('close-window', windowName, options);
	},
	hideWindow: (windowName: string, options: any) => {
		console.log('[electron] requested window hide', windowName, options);
		ipcRenderer.send('hide-window', windowName, options);
	},
	isMinimized: (windowName: string) => {
		console.log('[electron] requested window minimized', windowName);
		return ipcRenderer.invoke('is-window-minimized', windowName);
	},
	isClosed: (windowName: string) => {
		console.log('[electron] requested window closed', windowName);
		return ipcRenderer.invoke('is-window-closed', windowName);
	},
});
