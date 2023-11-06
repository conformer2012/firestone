import { BrowserWindow } from 'electron';
import { join } from 'path';
import { format } from 'url';
import { rendererAppName, rendererAppPort } from '../constants';

export class WindowService {
	private windowLookup: { [id: number]: string } = {};

	constructor(private readonly electronApp: Electron.App) {}

	public createWindow(windowName: string, options?: any) {
		console.log('[electron] createWindow', windowName, options);
		const config = windowsConfig[windowName];
		if (!config) {
			console.error('[electron] no config found for window', windowName);
			return;
		}

		let newWindow: BrowserWindow | null = new BrowserWindow({
			width: config.minWidth,
			height: config.minHeight,
			show: !config.hidden,
			webPreferences: {
				contextIsolation: true,
				backgroundThrottling: false,
				preload: join(__dirname, 'main.preload.js'),
			},
		});
		this.windowLookup[newWindow.webContents.id] = windowName;
		console.log('[electron] created Window', newWindow.id, newWindow.webContents.id, windowName);

		newWindow.once('ready-to-show', () => {
			if (!config.hidden) {
				newWindow.show();
			}
		});
		newWindow.on('closed', () => {
			// Dereference the window object, usually you would store windows
			// in an array if your app supports multi windows, this is the time
			// when you should delete the corresponding element.
			console.log('[electron] window closed', windowName);
			newWindow = null;
		});

		newWindow.webContents.openDevTools({ mode: 'detach' });

		// load the index.html of the app.
		if (!this.electronApp.isPackaged) {
			newWindow.loadURL(`http://localhost:${rendererAppPort}`);
		} else {
			newWindow.loadURL(
				format({
					pathname: join(__dirname, '..', rendererAppName, 'index.html'),
					protocol: 'file:',
					slashes: true,
				}),
			);
		}
	}

	public getCurrentWindowName(event: any): string {
		console.log(
			'[electron] getting current window name in window service',
			event.sender.id,
			this.windowLookup[event.sender.id],
		);
		return this.windowLookup[event.sender.id];
	}
}

const windowsConfig = {
	MainWindow: {
		minWidth: 0,
		minHeight: 0,
		hidden: true,
	},
	CollectionWindow: {
		minWidth: 1400,
		minHeight: 780,
	},
};
