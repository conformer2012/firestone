import { Injectable } from '@angular/core';
import { CardsFacadeService, WindowManagerService } from '@firestone/shared/framework/core';
import { Observable } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';
import { GameState } from '../../../models/decktracker/game-state';
import { PreferencesService } from '../../preferences.service';
import { AppUiStoreFacadeService } from '../../ui-store/app-ui-store-facade.service';
import { CardsHighlightCommonService } from './cards-highlight-common.service';

@Injectable()
export class CardsHighlightService extends CardsHighlightCommonService {
	constructor(
		protected readonly allCards: CardsFacadeService,
		private readonly prefs: PreferencesService,
		private readonly store: AppUiStoreFacadeService,
		windowManager: WindowManagerService,
	) {
		super(allCards);
		windowManager.registerGlobalService('cardsHighlightService', this);
		this.setup();
	}

	protected async setup() {
		await this.store.initComplete();
		const obs: Observable<GameState> = this.store
			.listenDeckState$((gameState) => gameState)
			.pipe(
				filter((gameState) => !!gameState),
				map(([gameState]) => gameState),
				takeUntil(this.destroyed$),
			);
		super.setup(obs, async () => {
			const prefs = await this.prefs.getPreferences();
			return prefs.overlayHighlightRelatedCards;
		});
	}
}
