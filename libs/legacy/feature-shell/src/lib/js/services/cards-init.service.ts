import { Injectable } from '@angular/core';
import { AllCardsService } from '@firestone-hs/reference-data';
import { WindowManagerService } from '@firestone/shared/framework/core';
import { distinctUntilChanged, map, skip } from 'rxjs';
import { CARDS_VERSION } from './hs-utils';
import { PreferencesService } from './preferences.service';

@Injectable()
export class CardsInitService {
	private inInit = false;

	constructor(
		private readonly cards: AllCardsService,
		private readonly prefs: PreferencesService,
		private readonly windowManager: WindowManagerService,
	) {}

	public async init() {
		if (this.inInit) {
			console.warn('already in init');
			return;
		}

		this.inInit = true;
		const prefs = await this.prefs.getPreferences();
		await this.initCards(prefs.locale);
		this.windowManager.registerGlobalService('cards', this.cards);
		this.startListeningToChanges();
	}

	private async startListeningToChanges() {
		await this.prefs.isReady();
		this.prefs.preferences$$
			.pipe(
				map((prefs) => prefs.locale),
				distinctUntilChanged(),
				skip(1), // Initial load is done in orchestrator
			)
			.subscribe((locale) => {
				this.initCards(locale);
			});
	}

	private async initCards(locale: string) {
		const fileName = this.getFileName(locale);
		console.log('[cards-init] initializing cards db with', fileName);
		await this.cards.initializeCardsDb(CARDS_VERSION, fileName, false);
	}

	private getFileName(locale: string) {
		return `cards_${locale}.gz.json`;
	}
}
