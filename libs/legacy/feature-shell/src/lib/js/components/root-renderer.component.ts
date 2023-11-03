import {
	AfterContentInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ContentChild,
	TemplateRef,
	ViewRef,
} from '@angular/core';
import { CardsFacadeService } from '@firestone/shared/framework/core';
import { LocalizationFacadeService } from '../services/localization-facade.service';

// https://stackoverflow.com/questions/44929726/angular4-ng-content-gets-built-when-ngif-is-false
@Component({
	selector: 'root-renderer',
	styleUrls: [`../../css/component/root-renderer.component.scss`],
	template: `
		<div *ngIf="ready">
			<ng-container *ngTemplateOutlet="contentOutlet"></ng-container>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RootRendererComponent implements AfterContentInit {
	@ContentChild(TemplateRef) contentOutlet;

	ready: boolean;

	constructor(
		private readonly cdr: ChangeDetectorRef,
		private readonly i18n: LocalizationFacadeService,
		private readonly allCards: CardsFacadeService,
	) {}

	async ngAfterContentInit() {
		console.debug('[debug] root-renderer init');
		await this.i18n.init();
		await this.allCards.waitForReady();
		console.debug('[debug] root-renderer init done');

		this.ready = true;
		if (!(this.cdr as ViewRef)?.destroyed) {
			this.cdr.detectChanges();
		}
	}
}
