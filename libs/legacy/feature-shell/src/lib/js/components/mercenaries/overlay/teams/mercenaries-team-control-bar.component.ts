import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { WindowManagerService } from '@firestone/shared/framework/core';
import { BehaviorSubject } from 'rxjs';
import { GameEvent } from '../../../../models/game-event';

@Component({
	selector: 'mercenaries-team-control-bar',
	styleUrls: [
		`../../../../../css/component/controls/controls.scss`,
		'../../../../../css/component/mercenaries/overlay/teams/mercenaries-team-control-bar.component.scss',
	],
	template: `
		<div class="control-bar">
			<div class="logo" inlineSVG="assets/svg/decktracker_logo.svg"></div>
			<div class="controls">
				<control-bug></control-bug>
				<control-settings [settingsApp]="'mercenaries'" [shouldMoveSettingsWindow]="false"> </control-settings>
				<!-- <control-close [eventProvider]="closeHandler" [askConfirmation]="true"></control-close> -->
			</div>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MercenariesTeamControlBarComponent {
	@Input() side: 'player' | 'opponent' | 'out-of-combat-player';

	closeHandler: () => void;

	private battleStateUpdater: BehaviorSubject<GameEvent>;

	constructor(private readonly windowManager: WindowManagerService) {
		this.init();
	}

	private async init() {
		this.battleStateUpdater = await this.windowManager.getGlobalService('battleStateUpdater');
		this.closeHandler = () => {
			if (this.side !== 'out-of-combat-player') {
				this.battleStateUpdater.next(
					Object.assign(new GameEvent(), {
						type:
							this.side === 'player'
								? 'MANUAL_TEAM_PLAYER_WIDGET_CLOSE'
								: 'MANUAL_TEAM_OPPONENT_WIDGET_CLOSE',
					} as GameEvent),
				);
			} else {
				// this.ow.closeWindow(this.windowId);
			}
		};
	}
}
