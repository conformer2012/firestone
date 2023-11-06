import { OverwolfService, WindowManagerService } from '@firestone/shared/framework/core';
import { BattlegroundsState } from '../../../../models/battlegrounds/battlegrounds-state';
import { PreferencesService } from '../../../preferences.service';
import { BattlegroundsStoreEvent } from '../events/_battlegrounds-store-event';
import { BattlegroundsOverlay } from './battlegrounds-overlay';

export class BgsMainWindowOverlay implements BattlegroundsOverlay {
	private closedByUser: boolean;

	constructor(
		private readonly prefs: PreferencesService,
		private readonly ow: OverwolfService,
		private readonly windowManager: WindowManagerService,
	) {}

	public async processEvent(gameEvent: BattlegroundsStoreEvent) {
		if (gameEvent.type === 'BgsMatchStartEvent') {
			this.closedByUser = false;
		} else if (gameEvent.type === 'BgsCloseWindowEvent') {
			this.closedByUser = true;
		}
	}

	public async updateOverlay(state: BattlegroundsState) {
		const prefs = await this.prefs.getPreferences();
		const bgsActive = prefs.bgsEnableApp && prefs.bgsFullToggle;
		const windowName = prefs.bgsUseOverlay
			? OverwolfService.BATTLEGROUNDS_WINDOW_OVERLAY
			: OverwolfService.BATTLEGROUNDS_WINDOW;
		const isWindowMinimized = await this.windowManager.isWindowMinimized(windowName);
		// Minimize is only triggered by a user action, so if they minimize it we don't touch it
		if (isWindowMinimized && !state.forceOpen) {
			return;
		}

		if (state?.forceOpen) {
			this.closedByUser = false;
		}
		const isWindowClosed = await this.windowManager.isWindowClosed(windowName);
		if (bgsActive && state?.forceOpen) {
			await this.windowManager.showWindow(windowName, {
				onlyIfNotMaximized: true,
				bringToFront: true,
			});
		}
		// In fact we don't want to close the window when the game ends
		else if (isWindowClosed && this.closedByUser) {
			await this.windowManager.closeWindow(windowName);
		}
	}

	public async handleHotkeyPressed(state: BattlegroundsState, force = false) {
		const inGame = state && state.inGame;
		if (!force && !inGame) {
			return;
		}

		const prefs = await this.prefs.getPreferences();
		const windowName = prefs.bgsUseOverlay
			? OverwolfService.BATTLEGROUNDS_WINDOW_OVERLAY
			: OverwolfService.BATTLEGROUNDS_WINDOW;
		const toggled = await this.windowManager.toggleWindow(windowName);
		if (toggled != null) {
			this.closedByUser = toggled.isNowClosed;
		}
	}
}
