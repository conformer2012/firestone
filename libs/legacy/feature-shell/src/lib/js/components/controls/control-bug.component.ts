import { AfterViewInit, ChangeDetectionStrategy, Component, EventEmitter } from '@angular/core';
import { OverwolfService, WindowManagerService } from '@firestone/shared/framework/core';
import { PreferencesService } from '../../services/preferences.service';

@Component({
	selector: 'control-bug',
	styleUrls: [
		`../../../css/component/controls/controls.scss`,
		`../../../css/component/controls/control-bug.component.scss`,
	],
	template: `
		<button
			(click)="showBugForm()"
			[helpTooltip]="'app.global.controls.bug-button-tooltip' | owTranslate"
			[attr.aria-label]="'app.global.controls.bug-button-tooltip' | owTranslate"
		>
			<svg class="svg-icon-fill">
				<use
					xmlns:xlink="https://www.w3.org/1999/xlink"
					xlink:href="assets/svg/sprite.svg#window-control_bug"
				></use>
			</svg>
		</button>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ControlBugComponent implements AfterViewInit {
	private settingsEventBus: EventEmitter<[string, string]>;

	constructor(
		private ow: OverwolfService,
		private prefs: PreferencesService,
		private readonly windowManager: WindowManagerService,
	) {}

	async ngAfterViewInit() {
		this.settingsEventBus = await this.windowManager.getGlobalService('settingsEventBus');
	}

	async showBugForm() {
		this.settingsEventBus.next(['general', 'bugreport']);
		// Avoid flickering
		setTimeout(async () => {
			const prefs = await this.prefs.getPreferences();
			const windowName = this.ow.getSettingsWindowName(prefs);
			await this.windowManager.showWindow(windowName);
		}, 10);
	}
}
