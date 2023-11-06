import { BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { format } from 'url';

export class MainController {
	private windows = [];

	constructor(private readonly electronApp: Electron.App) {}

	public bootstrap() {
		console.log('[electron] bootstrap electron app');
		// TODO: add all listeners here
		ipcMain.on('create-window', (event, arg) => {
			console.log('[electron] create-window in main', event, arg);
		});
	}

	public createBackgroundController(appName: string, appPort: number) {
		let mainWindow: BrowserWindow | null = new BrowserWindow({
			width: 0,
			height: 0,
			show: false,
			webPreferences: {
				contextIsolation: true,
				backgroundThrottling: false,
				preload: join(__dirname, 'main.preload.js'),
			},
		});
		mainWindow.on('closed', () => {
			// Dereference the window object, usually you would store windows
			// in an array if your app supports multi windows, this is the time
			// when you should delete the corresponding element.
			mainWindow = null;
		});

		mainWindow.webContents.openDevTools({ mode: 'detach' });

		// load the index.html of the app.
		if (!this.electronApp.isPackaged) {
			mainWindow.loadURL(`http://localhost:${appPort}`);
		} else {
			mainWindow.loadURL(
				format({
					pathname: join(__dirname, '..', appName, 'index.html'),
					protocol: 'file:',
					slashes: true,
				}),
			);
		}
	}
}
