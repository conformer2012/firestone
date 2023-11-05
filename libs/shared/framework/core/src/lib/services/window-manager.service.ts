import { Injectable, Optional } from '@angular/core';
import { OverwolfService } from './overwolf.service';
import { overwolf } from './overwolf/overwolf';

@Injectable()
export class WindowManagerService {
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
			startHidden?: boolean;
		},
	) {
		const window = await overwolf.windows.obtainDeclaredWindow(windowName);
		await overwolf.windows.restoreWindow(window.id);
		if (!options?.onlyIfNotMaximized || window.stateEx !== 'maximized') {
			if (options?.bringToFront) {
				await overwolf.windows.bringToFront(window.id);
			}
		}
		if (options?.startHidden) {
			await overwolf.windows.hideWindow(window.id);
		}
	}

	public async hideWindow(windowName: string) {
		return overwolf.windows.hideWindow(windowName);
	}

	public async closeWindow(windowName: string, options?: { hideInsteadOfClose: boolean }) {
		if (options?.hideInsteadOfClose) {
			await this.hideWindow(windowName);
		} else {
			await overwolf.windows.closeWindow(windowName);
		}
	}

	public async toggleWindow(
		windowName: string,
		options?: { hideInsteadOfClose: boolean },
	): Promise<{ isNowClosed: boolean } | null> {
		const window = await overwolf.windows.obtainDeclaredWindow(windowName);
		if (this.isWindowClosed(window.stateEx) || window.stateEx === 'minimized') {
			await overwolf.windows.obtainDeclaredWindow(windowName);
			await overwolf.windows.restoreWindow(windowName);
			await overwolf.windows.bringToFront(windowName);
			return { isNowClosed: false };
		} else if (!this.isWindowClosed(window.stateEx)) {
			await this.closeWindow(windowName, options);
			return { isNowClosed: true };
		}
		return null;
	}

	public async getCurrentWindowName(): Promise<string> {
		const window = await overwolf.windows.getCurrentWindow();
		return window.name;
	}

	public async isWindowVisible(windowName: string) {
		const window = await overwolf.windows.obtainDeclaredWindow(windowName);
		return window.isVisible;
	}

	public async resetWindowPosition(windowName: string) {
		const cWindow = await overwolf.windows.obtainDeclaredWindow(windowName);
		const wasVisible = cWindow.isVisible;
		await this.changeWindowPosition(cWindow.id, 0, 0);
		if (!wasVisible) {
			await overwolf.windows.closeWindow(cWindow.id);
		}
	}

	public async minimizeWindow(windowName: string) {
		return overwolf.windows.minimizeWindow(windowName);
	}
	public async maximizeWindow(windowName: string) {
		return overwolf.windows.maximizeWindow(windowName);
	}
	public async unmaximizeWindow(windowName: string) {
		return overwolf.windows.restoreWindow(windowName);
	}
	public async bringToFront(windowName: string) {
		return overwolf.windows.restoreWindow(windowName);
	}
	public async changeWindowPosition(windowName: string, left: number, top: number) {
		return overwolf.windows.changeWindowPosition(windowName, left, top);
	}
	public async changeWindowSize(windowName: string, width: number, height: number): Promise<void> {
		return overwolf.windows.changeWindowSize(windowName, width, height);
	}

	private isWindowClosed(state: string): boolean {
		return state === 'closed' || state === 'hidden';
	}
}
