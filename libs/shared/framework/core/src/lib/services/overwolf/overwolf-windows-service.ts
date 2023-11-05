import { overwolf } from './overwolf';

export const overwolfWindowsService = {
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
};
