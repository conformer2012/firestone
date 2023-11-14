import { AfterViewInit, ChangeDetectionStrategy, Component, EventEmitter, Input } from '@angular/core';
import { OverwolfService, WindowManagerService } from '@firestone/shared/framework/core';
import { CloseMainWindowEvent } from '../../services/mainwindow/store/events/close-main-window-event';
import { MainWindowStoreEvent } from '../../services/mainwindow/store/events/main-window-store-event';

@Component({
	selector: 'control-minimize',
	styleUrls: [
		`../../../css/component/controls/controls.scss`,
		`../../../css/component/controls/control-minimize.component.scss`,
	],
	template: `
		<button
			(mousedown)="minimizeWindow()"
			[attr.aria-label]="'Minimize app'"
			inlineSVG="assets/svg/control_minimize.svg"
		></button>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ControlMinimizeComponent implements AfterViewInit {
	@Input() windowId: string;
	@Input() isMainWindow: boolean;
	@Input() eventProvider: () => MainWindowStoreEvent;

	private stateUpdater: EventEmitter<MainWindowStoreEvent>;

	constructor(private ow: OverwolfService, private readonly windowManager: WindowManagerService) {}

	async ngAfterViewInit() {
		this.stateUpdater = await this.windowManager.getGlobalService('mainWindowStoreUpdater');
	}

	async minimizeWindow() {
		const windowName = (await this.ow.getCurrentWindow()).name;
		if (this.isMainWindow) {
			this.stateUpdater.next(new CloseMainWindowEvent());
		}
		// Delegate all the logic
		if (this.eventProvider) {
			this.eventProvider();
			return;
		}
		this.windowManager.minimizeWindow(windowName);
	}
}
