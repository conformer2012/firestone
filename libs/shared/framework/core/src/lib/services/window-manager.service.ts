import { Injectable, Optional } from '@angular/core';
import { electron } from './electron/electron';
import { OverwolfService } from './overwolf.service';
import { overwolf } from './overwolf/overwolf';

@Injectable()
export class WindowManagerService {
	private serviceDelegate: WindowManagerServiceDelegate;

	constructor(@Optional() private readonly ow: OverwolfService) {
		// this.init();
		this.serviceDelegate = this.ow?.isOwEnabled() ? overwolf.windowsService : electron.windowsService;
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
		this.serviceDelegate.showWindow(windowName, options);
	}

	public async hideWindow(windowName: string) {
		this.serviceDelegate.hideWindow(windowName);
	}

	public async closeWindow(windowName: string, options?: { hideInsteadOfClose: boolean }) {
		if (options?.hideInsteadOfClose) {
			await this.hideWindow(windowName);
		} else {
			this.serviceDelegate.closeWindow(windowName, options);
		}
	}

	public async toggleWindow(
		windowName: string,
		options?: { hideInsteadOfClose: boolean },
	): Promise<{ isNowClosed: boolean } | null> {
		const isMinimized = await this.isWindowMinimized(windowName);
		const isClosed = await this.isWindowClosed(windowName);
		if (isClosed || isMinimized) {
			await overwolf.windows.obtainDeclaredWindow(windowName);
			await overwolf.windows.restoreWindow(windowName);
			await overwolf.windows.bringToFront(windowName);
			return { isNowClosed: false };
		} else {
			await this.closeWindow(windowName, options);
			return { isNowClosed: true };
		}
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

	public async isWindowClosed(windowName: string): Promise<boolean> {
		const isClosed = await this.serviceDelegate.isClosed(windowName);
		return isClosed;
	}
	public async isWindowMinimized(windowName: string): Promise<boolean> {
		const isMinimized = await this.serviceDelegate.isMinimized(windowName);
		return isMinimized;
	}
}

export interface WindowManagerServiceDelegate {
	hideWindow(windowName: string): Promise<void>;
	isMinimized(windowName: string): Promise<boolean>;
	isClosed(windowName: string): Promise<boolean>;
	closeWindow(windowName: string, options?: { hideInsteadOfClose: boolean } | undefined): Promise<void>;
	showWindow(
		windowName: string,
		options?: {
			bringToFront?: boolean | undefined;
			onlyIfNotMaximized?: boolean | undefined;
			startHidden?: boolean | undefined;
		},
	);
}
