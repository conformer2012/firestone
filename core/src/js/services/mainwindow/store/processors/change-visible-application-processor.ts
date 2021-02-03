import { MainWindowState } from '../../../../models/mainwindow/main-window-state';
import { NavigationAchievements } from '../../../../models/mainwindow/navigation/navigation-achievements';
import { NavigationBattlegrounds } from '../../../../models/mainwindow/navigation/navigation-battlegrounds';
import { NavigationCollection } from '../../../../models/mainwindow/navigation/navigation-collection';
import { NavigationDecktracker } from '../../../../models/mainwindow/navigation/navigation-decktracker';
import { NavigationDuels } from '../../../../models/mainwindow/navigation/navigation-duels';
import { NavigationReplays } from '../../../../models/mainwindow/navigation/navigation-replays';
import { NavigationState } from '../../../../models/mainwindow/navigation/navigation-state';
import { ChangeVisibleApplicationEvent } from '../events/change-visible-application-event';
import { Processor } from './processor';

export class ChangeVisibleApplicationProcessor implements Processor {
	public async process(
		event: ChangeVisibleApplicationEvent,
		currentState: MainWindowState,
		stateHistory,
		navigationState: NavigationState,
	): Promise<[MainWindowState, NavigationState]> {
		// if (event.module === navigationState.currentApp) {
		// 	return [null, null];
		// }
		// console.log('changing application', event);
		const binder =
			event.module === 'collection'
				? navigationState.navigationCollection.update({
						currentView: 'sets',
						menuDisplayType: 'menu',
				  } as NavigationCollection)
				: navigationState.navigationCollection;
		const achievements =
			event.module === 'achievements'
				? navigationState.navigationAchievements.update({
						currentView: 'categories',
						menuDisplayType: 'menu',
						selectedCategoryId: undefined,
						selectedAchievementId: undefined,
				  } as NavigationAchievements)
				: navigationState.navigationAchievements;
		const replays =
			event.module === 'replays'
				? navigationState.navigationReplays.update({
						currentView: 'list',
						selectedReplay: undefined,
				  } as NavigationReplays)
				: navigationState.navigationReplays;
		const battlegrounds =
			event.module === 'battlegrounds'
				? navigationState.navigationBattlegrounds.update({
						currentView: 'list',
						selectedGlobalCategoryId: 'bgs-global-category-personal-stats',
						selectedCategoryId: 'bgs-category-personal-heroes',
						menuDisplayType: 'menu',
				  } as NavigationBattlegrounds)
				: navigationState.navigationBattlegrounds;
		const duels =
			event.module === 'duels'
				? navigationState.navigationDuels.update({
						selectedCategoryId: 'duels-runs',
						menuDisplayType: 'menu',
						expandedRunIds: [] as readonly string[],
						treasureSearchString: null,
				  } as NavigationDuels)
				: navigationState.navigationDuels;
		const decktracker =
			event.module === 'decktracker'
				? navigationState.navigationDecktracker.update({
						currentView: 'decks',
						menuDisplayType: 'menu',
						selectedDeckstring: null,
				  } as NavigationDecktracker)
				: navigationState.navigationBattlegrounds;
		return [
			null,
			navigationState.update({
				isVisible: true,
				currentApp: event.module,
				navigationCollection: binder,
				navigationAchievements: achievements,
				navigationReplays: replays,
				navigationBattlegrounds: battlegrounds,
				navigationDuels: duels,
				navigationDecktracker: decktracker,
				text: this.getInitialText(event.module),
				image: null,
			} as NavigationState),
		];
	}

	private getInitialText(module: string): string {
		switch (module) {
			case 'achievements':
				return 'Categories';
			case 'decktracker':
				return 'Decks';
			default:
				return null;
		}
	}
}
