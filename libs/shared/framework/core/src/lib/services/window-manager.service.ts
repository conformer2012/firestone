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

	public async showWindow(
		windowName: string,
		options?: {
			bringToFront?: boolean;
			onlyIfNotMaximized?: boolean;
		},
	) {
		const window = await this.ow.obtainDeclaredWindow(windowName);
		await this.ow.restoreWindow(window.id);
		if (!options?.onlyIfNotMaximized || window.stateEx !== 'maximized') {
			if (options?.bringToFront) {
				await this.ow.bringToFront(window.id);
			}
		}
	}

	public async closeWindow(windowName: string) {
		const window = await this.ow.obtainDeclaredWindow(windowName);
		await this.ow.closeWindow(window.id);
	}

	public async toggleWindow(
		windowName: string,
		options?: { hideInsteadOfClose: boolean },
	): Promise<{ isNowClosed: boolean } | null> {
		const window = await this.ow.obtainDeclaredWindow(windowName);
		if (this.isWindowClosed(window.stateEx) || window.stateEx === 'minimized') {
			await this.ow.obtainDeclaredWindow(windowName);
			await this.ow.restoreWindow(windowName);
			await this.ow.bringToFront(windowName);
			return { isNowClosed: false };
		} else if (!this.isWindowClosed(window.stateEx)) {
			if (options?.hideInsteadOfClose) {
				await this.ow.hideWindow(windowName);
			} else {
				await this.ow.closeWindow(windowName);
			}
			return { isNowClosed: true };
		}
		return null;
	}

	public async resetWindowPosition(windowName: string) {
		const cWindow = await this.ow.obtainDeclaredWindow(windowName);
		const wasVisible = cWindow.isVisible;
		await this.ow.changeWindowPosition(cWindow.id, 0, 0);
		if (!wasVisible) {
			await this.ow.closeWindow(cWindow.id);
		}
	}

	private isWindowClosed(state: string): boolean {
		return state === 'closed' || state === 'hidden';
	}
}
