import {
	AfterContentInit,
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	EventEmitter,
	Input,
	ViewRef,
} from '@angular/core';
import { MainWindowNavigationService } from '@firestone/mainwindow/common';
import { AbstractSubscriptionComponent } from '@firestone/shared/framework/common';
import { OverwolfService, waitForReady } from '@firestone/shared/framework/core';
import { LocalizationFacadeService } from '@legacy-import/src/lib/js/services/localization-facade.service';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { MainWindowStoreEvent } from '../../services/mainwindow/store/events/main-window-store-event';
import { NavigationBackEvent } from '../../services/mainwindow/store/events/navigation/navigation-back-event';
import { NavigationNextEvent } from '../../services/mainwindow/store/events/navigation/navigation-next-event';

@Component({
	selector: 'global-header',
	styleUrls: [
		`../../../css/global/menu.scss`,
		`../../../css/component/controls/controls.scss`,
		`../../../css/component/controls/main-window-navigation.component.scss`,
		`../../../css/component/main-window/global-header.component.scss`,
	],
	template: `
		<div class="global-header" *ngIf="text$ | async as text">
			<i class="i-13X7 arrow back" (click)="back()" *ngIf="backArrow">
				<svg class="svg-icon-fill">
					<use xlink:href="assets/svg/sprite.svg#collapse_caret" />
				</svg>
			</i>
			<img class="image" *ngIf="image$ | async as image" [src]="image" />
			<div class="text">{{ text }}</div>
			<!-- <i class="i-13X7 arrow next" (click)="next()" *ngIf="nextArrow$ | async">
				<svg class="svg-icon-fill">
					<use xlink:href="assets/svg/sprite.svg#collapse_caret" />
				</svg>
			</i> -->
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GlobalHeaderComponent extends AbstractSubscriptionComponent implements AfterContentInit, AfterViewInit {
	text$: Observable<string>;
	image$: Observable<string>;
	backArrow$: Observable<boolean>;
	nextArrow$: Observable<boolean>;

	@Input() backArrow: boolean;

	private stateUpdater: EventEmitter<MainWindowStoreEvent>;

	constructor(
		protected readonly cdr: ChangeDetectorRef,
		private readonly ow: OverwolfService,
		private readonly i18n: LocalizationFacadeService,
		private readonly nav: MainWindowNavigationService,
	) {
		super(cdr);
	}

	async ngAfterContentInit() {
		await waitForReady(this.nav);

		this.text$ = this.nav.text$$.pipe(
			filter((text) => !!text),
			this.mapData((text) => this.i18n.translateString(text)),
		);
		this.image$ = this.nav.image$$.pipe(
			filter((image) => !!image),
			this.mapData((image) => image),
		);
		this.backArrow$ = this.nav.backArrowEnabled$$.pipe(this.mapData((backArrowEnabled) => backArrowEnabled));
		this.nextArrow$ = this.nav.nextArrowEnabled$$.pipe(this.mapData((nextArrowEnabled) => nextArrowEnabled));

		if (!(this.cdr as ViewRef).destroyed) {
			this.cdr.detectChanges();
		}
	}

	ngAfterViewInit() {
		this.stateUpdater = this.ow.getMainWindow().mainWindowStoreUpdater;
	}

	back() {
		this.stateUpdater.next(new NavigationBackEvent());
	}

	next() {
		this.stateUpdater.next(new NavigationNextEvent());
	}
}
