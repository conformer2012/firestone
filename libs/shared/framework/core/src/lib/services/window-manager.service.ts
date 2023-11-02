import { Injectable, Optional } from '@angular/core';
import { OverwolfService } from './overwolf.service';

@Injectable()
export class WindowManagerService {
	// private mainWindow;

	constructor(@Optional() private readonly ow: OverwolfService) {
		// this.init();
	}

	public getGlobalService<T>(serviceName: string): T {
		if (this.ow?.isOwEnabled()) {
			const mainWindow = this.ow.getMainWindow();
			const result = mainWindow[serviceName];
			// console.debug('got service', serviceName, result, mainWindow);
			return result;
		}
		const globalServices = window['globalServices'];
		if (!!globalServices) {
			return globalServices[serviceName];
		}
		return window[serviceName];
	}

	public async registerGlobalService<T>(serviceName: string, service: T) {
		if (this.ow?.isOwEnabled()) {
			const mainWindow = this.ow.getMainWindow();
			mainWindow[serviceName] = service;
			return;
		}

		const globalServices = window['globalServices'];
		if (!!globalServices) {
			globalServices[serviceName] = service;
			return;
		}

		window[serviceName] = service;
		return;
	}

	// public async isMainWindow() {
	// 	const currentWindow = this.ow?.isOwEnabled() ? await this.ow.getCurrentWindow() : null;
	// 	return !currentWindow || currentWindow?.name === OverwolfService.MAIN_WINDOW;
	// }

	// public async getMainWindow() {
	// 	if (!this.mainWindow) {
	// 		await this.init();
	// 	}
	// 	return this.mainWindow;
	// }

	// public getMainWindowSyncWithPossibleNull() {
	// 	return this.mainWindow;
	// }

	// private async init() {
	// 	const currentWindow = await this.ow?.getCurrentWindow();
	// 	if (!this.ow || !currentWindow || currentWindow?.name === OverwolfService.MAIN_WINDOW) {
	// 		this.mainWindow = window;
	// 	} else {
	// 		this.mainWindow = this.ow.getMainWindow();
	// 	}
	// }
}
