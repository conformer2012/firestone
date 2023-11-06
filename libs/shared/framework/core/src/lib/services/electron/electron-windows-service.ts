export const electronWindowsService = {
	showWindow: async (
		windowName: string,
		options?: {
			bringToFront?: boolean;
			onlyIfNotMaximized?: boolean;
			startHidden?: boolean;
		},
	) => {
		const elWindowServices = (window as any).windowServices;
		console.debug('[electron] showing window', windowName, options, elWindowServices);
		elWindowServices.createWindow(windowName, options);
	},
};
