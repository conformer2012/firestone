/* eslint-disable @typescript-eslint/no-use-before-define */
import { Injectable } from '@angular/core';
import { BgsQuestStats } from '@firestone-hs/bgs-global-stats';
import { BgsActiveTimeFilterType } from '@firestone/battlegrounds/data-access';
import { SubscriberAwareBehaviorSubject } from '@firestone/shared/framework/common';
import { ApiRunner, WindowManagerService } from '@firestone/shared/framework/core';
import { filter } from 'rxjs/operators';
import { AppUiStoreFacadeService } from '../ui-store/app-ui-store-facade.service';
import { fixInvalidTimeSuffix } from './bgs-global-stats.service';

const BGS_QUESTS_URL = 'https://static.zerotoheroes.com/api/bgs/quests/bgs-quests-v2-%timeSuffix%.gz.json';

@Injectable()
export class BattlegroundsQuestsService {
	public questStats$$ = new SubscriberAwareBehaviorSubject<BgsQuestStats>(null);

	constructor(
		private readonly api: ApiRunner,
		private readonly store: AppUiStoreFacadeService,
		windowManager: WindowManagerService,
	) {
		windowManager.registerGlobalService('bgsQuests', this);
		this.init();
	}

	private async init() {
		await this.store.initComplete();

		this.questStats$$.onFirstSubscribe(async () => {
			this.store
				.listenPrefs$((prefs) => prefs.bgsActiveTimeFilter)
				.pipe(filter(([timeFilter]) => !!timeFilter))
				.subscribe(async ([timeFilter]) => {
					const quests = await this.loadQuests(timeFilter);
					this.questStats$$.next(quests);
				});
		});
	}

	private async loadQuests(timeFilter: BgsActiveTimeFilterType): Promise<BgsQuestStats> {
		console.debug('[bgs-quests] loading quests', timeFilter);
		const quests: BgsQuestStats = await this.api.callGetApi(
			BGS_QUESTS_URL.replace('%timeSuffix%', fixInvalidTimeSuffix(timeFilter)),
		);
		console.debug('[bgs-quests] loaded quests', quests);
		return quests;
	}
}
