import { ChangeDetectionStrategy, Component, EventEmitter, Input } from '@angular/core';
import { WindowManagerService } from '@firestone/shared/framework/core';
import { GameEvent } from '../../models/game-event';

@Component({
	selector: 'secrets-helper-control-bar',
	styleUrls: ['../../../css/component/secrets-helper/secrets-helper-control-bar.component.scss'],
	template: `
		<div class="control-bar">
			<div class="title" [owTranslate]="'decktracker.secrets-helper.title'"></div>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecretsHelperControlBarComponent {
	@Input() windowId: string;
	minimizeHandler: () => void;

	private deckUpdater: EventEmitter<GameEvent>;

	constructor(private readonly windowManager: WindowManagerService) {
		this.init();
	}

	private async init() {
		const mainWindow = await this.windowManager.getMainWindow();
		this.deckUpdater = mainWindow.deckUpdater;
		this.minimizeHandler = () =>
			this.deckUpdater.next(
				Object.assign(new GameEvent(), {
					type: 'TOGGLE_SECRET_HELPER',
				} as GameEvent),
			);
	}
}
