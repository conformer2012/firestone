import {
	AfterContentInit,
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	EventEmitter,
} from '@angular/core';
import { WindowManagerService } from '@firestone/shared/framework/core';
import { Observable } from 'rxjs';
import { DuelsCategory } from '../../../models/mainwindow/duels/duels-category';
import { DuelsCategoryType } from '../../../models/mainwindow/duels/duels-category.type';
import { DuelsSelectCategoryEvent } from '../../../services/mainwindow/store/events/duels/duels-select-category-event';
import { MainWindowStoreEvent } from '../../../services/mainwindow/store/events/main-window-store-event';
import { AppUiStoreFacadeService } from '../../../services/ui-store/app-ui-store-facade.service';
import { AbstractSubscriptionStoreComponent } from '../../abstract-subscription-store.component';

@Component({
	selector: 'duels-desktop',
	styleUrls: [
		`../../../../css/component/app-section.component.scss`,
		`../../../../css/component/menu-selection.component.scss`,
		`../../../../css/component/duels/desktop/duels-desktop.component.scss`,
	],
	template: `
		<div class="app-section duels" *ngIf="{ value: category$ | async } as category">
			<section class="main divider">
				<with-loading [isLoading]="loading$ | async">
					<div class="content main-content" *ngIf="{ value: menuDisplayType$ | async } as menuDisplayType">
						<global-header *ngIf="menuDisplayType.value === 'breadcrumbs'"></global-header>
						<ul class="menu-selection" *ngIf="menuDisplayType.value === 'menu'">
							<li
								*ngFor="let cat of categories$ | async"
								[ngClass]="{ selected: cat.id === category.value?.id }"
								(mousedown)="selectCategory(cat.id)"
							>
								<span>{{ cat.name }} </span>
							</li>
						</ul>
						<duels-filters> </duels-filters>
						<duels-runs-list *ngIf="category.value?.id === 'duels-runs'"> </duels-runs-list>
						<duels-hero-stats *ngIf="category.value?.id === 'duels-stats'"></duels-hero-stats>
						<duels-treasure-stats *ngIf="category.value?.id === 'duels-treasures'"></duels-treasure-stats>
						<duels-personal-decks
							*ngIf="category.value?.id === 'duels-personal-decks'"
						></duels-personal-decks>
						<duels-personal-deck-details
							*ngIf="
								category.value?.id === 'duels-personal-deck-details' ||
								category.value?.id === 'duels-deck-details'
							"
						>
						</duels-personal-deck-details>
						<duels-top-decks *ngIf="category.value?.id === 'duels-top-decks'"> </duels-top-decks>
						<duels-leaderboard *ngIf="category.value?.id === 'duels-leaderboard'"></duels-leaderboard>
						<duels-deckbuilder *ngIf="category.value?.id === 'duels-deckbuilder'"></duels-deckbuilder>
						<duels-buckets *ngIf="category.value?.id === 'duels-buckets'"></duels-buckets>
					</div>
				</with-loading>
			</section>
			<section class="secondary" *ngIf="!(showAds$ | async) && showSidebar(category.value?.id)">
				<duels-hero-search *ngIf="category.value?.id === 'duels-stats'"></duels-hero-search>
				<duels-treasure-search *ngIf="category.value?.id === 'duels-treasures'"></duels-treasure-search>
				<duels-classes-recap *ngIf="category.value?.id === 'duels-runs'"></duels-classes-recap>
				<duels-replays-recap *ngIf="category.value?.id === 'duels-personal-decks'"></duels-replays-recap>
				<duels-treasure-tier-list *ngIf="category.value?.id === 'duels-treasures'"></duels-treasure-tier-list>
				<duels-hero-tier-list *ngIf="category.value?.id === 'duels-stats'"></duels-hero-tier-list>
				<duels-deck-stats
					*ngIf="
						category.value?.id === 'duels-personal-deck-details' ||
						category.value?.id === 'duels-deck-details'
					"
				></duels-deck-stats>
			</section>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DuelsDesktopComponent
	extends AbstractSubscriptionStoreComponent
	implements AfterContentInit, AfterViewInit
{
	loading$: Observable<boolean>;
	menuDisplayType$: Observable<string>;
	categories$: Observable<readonly DuelsCategory[]>;
	category$: Observable<DuelsCategory>;
	showAds$: Observable<boolean>;

	private stateUpdater: EventEmitter<MainWindowStoreEvent>;

	constructor(
		protected readonly store: AppUiStoreFacadeService,
		protected readonly cdr: ChangeDetectorRef,
		private readonly windowManager: WindowManagerService,
	) {
		super(store, cdr);
	}

	ngAfterContentInit() {
		this.loading$ = this.store
			.listen$(([main, nav]) => main.duels.loading)
			.pipe(this.mapData(([loading]) => loading));
		this.menuDisplayType$ = this.store
			.listen$(([main, nav]) => nav.navigationDuels.menuDisplayType)
			.pipe(this.mapData(([menuDisplayType]) => menuDisplayType));
		this.categories$ = this.store
			.listen$(([main, nav]) => main.duels.categories)
			.pipe(this.mapData(([categories]) => (categories ?? []).filter((cat) => !!cat.name)));
		this.category$ = this.store
			.listen$(
				([main, nav]) => main.duels,
				([main, nav]) => nav.navigationDuels.selectedCategoryId,
			)
			.pipe(this.mapData(([duels, selectedCategoryId]) => duels.findCategory(selectedCategoryId)));
		this.showAds$ = this.store.showAds$().pipe(this.mapData((info) => info));
	}

	async ngAfterViewInit() {
		const mainWindow = await this.windowManager.getMainWindow();
		this.stateUpdater = mainWindow.mainWindowStoreUpdater;
	}

	selectCategory(categoryId: DuelsCategoryType) {
		this.stateUpdater.next(new DuelsSelectCategoryEvent(categoryId));
	}

	showSidebar(categoryId: DuelsCategoryType): boolean {
		return !['duels-top-decks', 'duels-leaderboard', 'duels-deckbuilder', 'duels-buckets'].includes(categoryId);
	}
}
