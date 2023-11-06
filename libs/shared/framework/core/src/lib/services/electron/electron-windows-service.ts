import { WindowManagerServiceDelegate } from '../window-manager.service';

export const electronWindowsService: WindowManagerServiceDelegate = {
	showWindow: async (
		windowName: string,
		options?: {
			bringToFront?: boolean;
			onlyIfNotMaximized?: boolean;
			startHidden?: boolean;
		},
	) => {
		console.debug('[electron] showing window', windowName, options);
		getWindowServices().createWindow(windowName, options);
	},
	closeWindow: async (windowName: string, options?: { hideInsteadOfClose: boolean }) => {
		console.debug('[electron] closing window', windowName, options);
		getWindowServices().closeWindow(windowName, options);
	},
	hideWindow: async (windowName: string) => {
		console.debug('[electron] hiding window', windowName);
		getWindowServices().hideWindow(windowName, { hideInsteadOfClose: true });
	},
	isMinimized: async (windowName: string) => {
		console.debug('[electron] checking if window is minimized', windowName);
		const isMinimized = await getWindowServices().isMinimized(windowName);
		return isMinimized;
	},
	isClosed: async (windowName: string) => {
		console.debug('[electron] checking if window is closde', windowName);
		const isClosed = await getWindowServices().isClosed(windowName);
		return isClosed;
	},
};

const getWindowServices = () => (window as any).windowServices;
