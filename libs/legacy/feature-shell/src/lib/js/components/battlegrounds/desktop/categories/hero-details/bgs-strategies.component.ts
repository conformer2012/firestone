import { AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { CardsFacadeService } from '@firestone/shared/framework/core';
import { PatchInfo } from '@legacy-import/src/lib/js/models/patches';
import {
	BgsHeroStratAuthor,
	BgsHeroStratTip,
} from '@legacy-import/src/lib/js/services/battlegrounds/bgs-meta-hero-strategies.service';
import { currentBgHeroId } from '@legacy-import/src/lib/js/services/ui-store/app-ui-store.service';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { LocalizationFacadeService } from '../../../../../services/localization-facade.service';
import { AppUiStoreFacadeService } from '../../../../../services/ui-store/app-ui-store-facade.service';
import { AbstractSubscriptionStoreComponent } from '../../../../abstract-subscription-store.component';

@Component({
	selector: 'bgs-strategies',
	styleUrls: [
		`../../../../../../css/component/battlegrounds/desktop/categories/hero-details/bgs-strategies.component.scss`,
	],
	template: `
		<div class="strategies" *ngIf="{ strategies: strategies$ | async } as value">
			<div class="strategy" *ngFor="let strat of value.strategies">
				<div class="summary">
					<div class="background"></div>
					<blockquote class="text" [innerHTML]="strat.summary"></blockquote>
				</div>
				<div class="author">
					<div class="name" [helpTooltip]="strat.author?.tooltip" *ngIf="!strat.author?.link">
						{{ strat.author?.name }}
					</div>
					<a
						class="name"
						[helpTooltip]="strat.author?.tooltip"
						*ngIf="strat.author?.link"
						href="{{ strat.author?.link }}"
						target="_blank"
						>{{ strat.author?.name }}</a
					>
					<div class="date">{{ strat.date }}</div>
				</div>
			</div>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BgsStrategiesComponent extends AbstractSubscriptionStoreComponent implements AfterContentInit {
	strategies$: Observable<readonly Strategy[]>;

	loading = true;
	visible = false;

	constructor(
		private readonly allCards: CardsFacadeService,
		private readonly i18n: LocalizationFacadeService,
		protected readonly store: AppUiStoreFacadeService,
		protected readonly cdr: ChangeDetectorRef,
	) {
		super(store, cdr);
	}

	ngAfterContentInit() {
		this.strategies$ = this.store
			.listen$(
				([main]) => main.battlegrounds.getMetaHeroStrategies(),
				([main]) => main.patchConfig,
				([main, nav]) => nav.navigationBattlegrounds.selectedCategoryId,
			)
			.pipe(
				filter(([strats, patchConfig, categoryId]) => !!strats?.heroes?.length),
				this.mapData(([strats, patchConfig, categoryId]) => {
					console.debug('strats', strats);
					const heroId = currentBgHeroId(null, categoryId);
					const stratsForHero: readonly BgsHeroStratTip[] =
						strats.heroes.find((h) => h.id === heroId)?.tips ?? [];

					return stratsForHero.map((strat) => {
						const author: BgsHeroStratAuthor = strats.authors.find((a) => a.id === strat.author);
						const patch: PatchInfo = patchConfig?.patches?.find((p) => p.number === strat.patch);
						return {
							summary: strat.summary,
							date: this.i18n.translateString('app.battlegrounds.strategies.date', {
								date: new Date(strat.date).toLocaleString(this.i18n.formatCurrentLocale(), {
									year: 'numeric',
									month: 'short',
									day: '2-digit',
								}),
								patch: patch?.version ?? strat.patch,
							}),
							author: {
								name: author?.name,
								tooltip: author?.highlights,
								link: author?.link,
							},
						};
					});
				}),
			);
	}
}

interface Strategy {
	readonly summary: string;
	readonly date: string;
	readonly author: {
		readonly name: string;
		readonly tooltip: string;
		readonly link?: string;
	};
}
