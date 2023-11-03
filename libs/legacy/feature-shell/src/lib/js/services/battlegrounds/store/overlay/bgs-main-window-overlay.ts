import { OverwolfService, WindowManagerService } from '@firestone/shared/framework/core';
import { BattlegroundsState } from '../../../../models/battlegrounds/battlegrounds-state';
import { PreferencesService } from '../../../preferences.service';
import { isWindowClosed } from '../../../utils';
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
		const battlegroundsWindow = await this.ow.getWindowState(windowName);
		// Minimize is only triggered by a user action, so if they minimize it we don't touch it
		if (battlegroundsWindow.window_state_ex === 'minimized' && !state.forceOpen) {
			return;
		}

		if (state?.forceOpen) {
			this.closedByUser = false;
		}
		if (bgsActive && state?.forceOpen) {
			await this.windowManager.showWindow(windowName, {
				onlyIfNotMaximized: true,
				bringToFront: true,
			});
		}
		// In fact we don't want to close the window when the game ends
		else if (
			!isWindowClosed(battlegroundsWindow.window_state_ex) &&
			!isWindowClosed(battlegroundsWindow.stateEx) &&
			this.closedByUser
		) {
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
