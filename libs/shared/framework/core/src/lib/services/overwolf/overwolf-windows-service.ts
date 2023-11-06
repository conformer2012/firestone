import { WindowManagerServiceDelegate } from '../window-manager.service';
import { overwolf } from './overwolf';

export const overwolfWindowsService: WindowManagerServiceDelegate = {
	getCurrentWindowName: async () => {
		const window = await overwolf.windows.getCurrentWindow();
		return window.name;
	},
	showWindow: async (
		windowName: string,
		options?: {
			bringToFront?: boolean;
			onlyIfNotMaximized?: boolean;
			startHidden?: boolean;
		},
	) => {
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
	},
	closeWindow: async (windowName: string, options?: { hideInsteadOfClose: boolean }) => {
		overwolf.windows.closeWindow(windowName);
	},
	hideWindow: async (windowName: string) => {
		overwolf.windows.hideWindow(windowName);
	},
	isMinimized: async (windowName: string) => {
		const window = await overwolf.windows.obtainDeclaredWindow(windowName);
		return window?.stateEx === 'minimized';
	},
	isClosed: async (windowName: string) => {
		const window = await overwolf.windows.obtainDeclaredWindow(windowName);
		return window?.stateEx === 'closed' || window?.stateEx === 'hidden';
	},
};
