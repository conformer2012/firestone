import { AfterViewInit, ChangeDetectionStrategy, Component, HostListener } from '@angular/core';
import { OverwolfService } from '@firestone/shared/framework/core';
import { LocalizationFacadeService } from '../../services/localization-facade.service';

@Component({
	selector: 'lottery-window',
	styleUrls: [
		`../../../css/themes/general-theme.scss`,
		'../../../css/component/lottery/lottery-window.component.scss',
	],
	template: `<div class="overlay-container-parent general-theme">
		<lottery class="widget"></lottery>
	</div> `,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LotteryWindowComponent implements AfterViewInit {
	private windowId: string;

	constructor(private readonly ow: OverwolfService, private readonly i18n: LocalizationFacadeService) {}

	@HostListener('mousedown', ['$event'])
	dragMove(event: MouseEvent) {
		this.ow.dragMove(this.windowId);
	}

	async ngAfterViewInit() {
		await this.i18n.isReady();

		const currentWindow = await this.ow.getCurrentWindow();
		this.windowId = currentWindow.id;
	}
}
