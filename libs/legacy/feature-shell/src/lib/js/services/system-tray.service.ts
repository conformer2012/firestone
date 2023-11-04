import { EventEmitter, Injectable } from '@angular/core';
import { OverwolfService, WindowManagerService } from '@firestone/shared/framework/core';
import { LocalizationService } from './localization.service';
import { PreferencesService } from './preferences.service';

@Injectable()
export class SystemTrayService {
	private settingsEventBus: EventEmitter<[string, string]>;

	constructor(
		private readonly ow: OverwolfService,
		private readonly i18n: LocalizationService,
		private readonly prefs: PreferencesService,
		private readonly windowManager: WindowManagerService,
	) {
		this.init();
	}

	private async init() {
		await this.i18n.initReady();

		const menu: overwolf.os.tray.ExtensionTrayMenu = {
			menu_items: [
				{
					id: 'main-window',
					label: this.i18n.translateString('app.tray.main-window'),
				},
				{
					id: 'settings',
					label: this.i18n.translateString('app.tray.settings'),
				},
				{
					id: 'reset-positions',
					label: this.i18n.translateString('app.tray.reset-positions'),
				},
				{
					id: 'restart',
					label: this.i18n.translateString('app.tray.restart'),
				},
				{
					id: 'exit',
					label: this.i18n.translateString('app.tray.exit'),
				},
			],
		};

		this.ow.onTrayMenuClicked((event) => {
			switch (event?.item) {
				case 'main-window':
					this.showMainWindow();
					return;
				case 'settings':
					this.showSettingsWindow();
					return;
				case 'reset-positions':
					this.resetWindowPositions();
					return;
				case 'restart':
					this.ow.relaunchApp();
					return;
				case 'exit':
					this.exitApp();
					return;
			}
		});
		await this.ow.setTrayMenu(menu);
		this.settingsEventBus = await this.windowManager.getGlobalService('settingsEventBus');
	}

	private async resetWindowPositions() {
		const windows = [
			OverwolfService.COLLECTION_WINDOW,
			OverwolfService.COLLECTION_WINDOW_OVERLAY,
			OverwolfService.SETTINGS_WINDOW,
			OverwolfService.SETTINGS_WINDOW_OVERLAY,
			OverwolfService.LOADING_WINDOW,
			OverwolfService.BATTLEGROUNDS_WINDOW,
			OverwolfService.BATTLEGROUNDS_WINDOW_OVERLAY,
			OverwolfService.LOTTERY_WINDOW,
		];
		for (const w of windows) {
			await this.windowManager.resetWindowPosition(w);
		}
	}

	private async showSettingsWindow() {
		this.settingsEventBus.next([null, null]);

		const prefs = await this.prefs.getPreferences();
		const windowName = this.ow.getSettingsWindowName(prefs);
		this.windowManager.showWindow(windowName, { bringToFront: true });
	}

	private async showMainWindow() {
		const prefs = await this.prefs.getPreferences();
		const mainWindowName = this.ow.getCollectionWindowName(prefs);
		await this.windowManager.showWindow(mainWindowName, { bringToFront: true });
	}

	private exitApp() {
		console.log('exiting app');
		this.windowManager.closeWindow(OverwolfService.MAIN_WINDOW);
	}
}
