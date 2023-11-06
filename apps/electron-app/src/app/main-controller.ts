import { ipcMain } from 'electron';
import { WindowService } from './services/window-service';

export class MainController {
	private readonly windowService: WindowService;

	constructor(private readonly electronApp: Electron.App) {
		this.windowService = new WindowService(electronApp);
	}

	public bootstrap() {
		console.log('[electron] bootstrap electron app');
		// TODO: add all listeners here
		ipcMain.on('create-window', (event, windowName, options) => {
			// console.log('[electron] create-window in main', windowName);
			this.windowService.createWindow(windowName, options);
		});
		ipcMain.on('close-window', (event, arg) => {
			console.log('[electron] close-window in main', arg);
		});
		ipcMain.on('hide-window', (event, arg) => {
			console.log('[electron] hide-window in main', arg);
		});
		ipcMain.handle('is-window-minimized', () => {
			console.log('[electron] is-window-minimized in main');
			return false;
		});
		ipcMain.handle('is-window-closed', () => {
			console.log('[electron] is-window-closed in main');
			return false;
		});
		ipcMain.handle('get-current-window-name', (event) => {
			return this.windowService.getCurrentWindowName(event);
		});
	}

	public createBackgroundController() {
		this.windowService.createWindow('MainWindow');
	}
}
