import { ExtendedWindowInfo } from '../overwolf.service';

export const overwolfWindows = {
	obtainDeclaredWindow: (windowName: string): Promise<overwolf.windows.WindowInfo> => {
		return new Promise<overwolf.windows.WindowInfo>((resolve, reject) => {
			overwolf.windows.obtainDeclaredWindow(windowName, (res) => {
				if (res.success) {
					resolve(res.window);
				}
			});
		});
	},

	getCurrentWindow: (): Promise<ExtendedWindowInfo> => {
		return new Promise<ExtendedWindowInfo>((resolve) => {
			try {
				overwolf.windows.getCurrentWindow((res: overwolf.windows.WindowResult) => {
					resolve(res.window as ExtendedWindowInfo);
				});
			} catch (e) {
				console.warn('Exception while getting current window window');
				resolve(null as any);
			}
		});
	},

	restoreWindow: (windowName: string): Promise<overwolf.windows.WindowIdResult | null> => {
		return new Promise<overwolf.windows.WindowIdResult | null>((resolve) => {
			try {
				overwolf.windows.restore(windowName, async (result) => {
					resolve(result);
				});
			} catch (e) {
				// This doesn't seem to prevent the window from being restored, so let's ignore it
				console.warn('Exception while restoring window', e);
				resolve(null);
			}
		});
	},

	closeWindow: (windowName: string) => {
		return new Promise<overwolf.windows.WindowIdResult>((resolve) => {
			overwolf.windows.close(windowName, (result) => {
				resolve(result);
			});
		});
	},

	bringToFront: (windowName: string, grabFocus = false): Promise<overwolf.windows.WindowIdResult | null> => {
		return new Promise<overwolf.windows.WindowIdResult | null>((resolve) => {
			// https://overwolf.github.io/docs/api/overwolf-windows#setdesktoponlywindowid-shouldbedesktoponly-callback
			try {
				overwolf.windows.bringToFront(windowName, grabFocus, (result) => {
					resolve(result);
				});
			} catch (e) {
				console.warn('exception when bringing to front', windowName, e);
				resolve(null);
			}
		});
	},

	hideWindow: (windowId: string) => {
		return new Promise<overwolf.windows.WindowIdResult | null>((resolve) => {
			try {
				overwolf.windows.hide(windowId, (result) => {
					resolve(result);
				});
			} catch (e) {
				// This doesn't seem to prevent the window from being restored, so let's ignore it
				console.warn('Exception while hiding window', e);
				resolve(null);
			}
		});
	},

	minimizeWindow: (windowId: string) => {
		return new Promise<overwolf.windows.WindowIdResult>((resolve) => {
			overwolf.windows.minimize(windowId, (result) => {
				resolve(result);
			});
		});
	},

	maximizeWindow: (windowId: string) => {
		return new Promise<overwolf.windows.WindowIdResult>((resolve) => {
			overwolf.windows.maximize(windowId, (result) => {
				resolve(result);
			});
		});
	},

	changeWindowPosition: (windowId: string, newX: number, newY: number): Promise<void> => {
		return new Promise<void>((resolve) => {
			try {
				overwolf.windows.changePosition(windowId, Math.round(newX), Math.round(newY), (res) => {
					resolve();
				});
			} catch (e) {
				console.error('Exception while trying to changePosition', windowId, newX, newY, e);
				resolve();
			}
		});
	},
};
