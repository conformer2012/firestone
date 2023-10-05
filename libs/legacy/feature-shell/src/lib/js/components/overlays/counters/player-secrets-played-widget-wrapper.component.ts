import {
	AfterContentInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	Renderer2,
} from '@angular/core';
import { CardIds } from '@firestone-hs/reference-data';
import { CardsFacadeService, OverwolfService } from '@firestone/shared/framework/core';
import { PreferencesService } from '../../../services/preferences.service';
import { AppUiStoreFacadeService } from '../../../services/ui-store/app-ui-store-facade.service';
import { AbstractCounterWidgetWrapperComponent, templateBase } from './abstract-counter-widget-wrapper.component';

@Component({
	selector: 'player-secrets-played-widget-wrapper',
	styleUrls: ['../../../../css/component/overlays/decktracker-player-widget-wrapper.component.scss'],
	template: templateBase,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerSecretsPlayedWidgetWrapperComponent
	extends AbstractCounterWidgetWrapperComponent
	implements AfterContentInit
{
	constructor(
		private readonly allCards: CardsFacadeService,
		protected readonly ow: OverwolfService,
		protected readonly el: ElementRef,
		protected readonly prefs: PreferencesService,
		protected readonly renderer: Renderer2,
		protected readonly store: AppUiStoreFacadeService,
		protected readonly cdr: ChangeDetectorRef,
	) {
		super(ow, el, prefs, renderer, store, cdr);
		this.side = 'player';
		this.activeCounter = 'secretsPlayed';
	}

	ngAfterContentInit(): void {
		this.prefExtractor = (prefs) => prefs.playerSecretsPlayedCounter;
		this.deckStateExtractor = (state, prefValue) =>
			state.playerDeck?.hasRelevantCard(
				[
					CardIds.KabalCrystalRunner,
					CardIds.KabalCrystalRunner_WON_308,
					CardIds.StalkingPrideTavernBrawlToken,
					CardIds.SrTombDiverTavernBrawl,
					CardIds.JrTombDiverTavernBrawl,
					CardIds.JrTombDiver,
					CardIds.SrTombDiver_ULDA_021,
				],
				{
					onlyLimited: prefValue === 'limited',
				},
			);
		super.ngAfterContentInit();
	}
}