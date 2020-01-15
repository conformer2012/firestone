import { DeckState } from '../../../models/decktracker/deck-state';
import { GameState } from '../../../models/decktracker/game-state';
import { HeroCard } from '../../../models/decktracker/hero-card';
import { GameEvent } from '../../../models/game-event';
import { EventParser } from './event-parser';

export class LocalPlayerParser implements EventParser {
	applies(gameEvent: GameEvent, state: GameState): boolean {
		return state && state.playerDeck && gameEvent.type === GameEvent.LOCAL_PLAYER;
	}

	async parse(currentState: GameState, gameEvent: GameEvent): Promise<GameState> {
		const battleTag = gameEvent.localPlayer && gameEvent.localPlayer.Name;
		const playerName = battleTag && battleTag.indexOf('#') !== -1 ? battleTag.split('#')[0] : battleTag;
		const newHero = Object.assign(new HeroCard(), currentState.playerDeck.hero, {
			playerName: playerName,
		} as HeroCard);
		const newPlayerDeck = Object.assign(new DeckState(), currentState.playerDeck, {
			hero: newHero,
		} as DeckState);
		return Object.assign(new GameState(), currentState, {
			playerDeck: newPlayerDeck,
		});
	}

	event(): string {
		return GameEvent.LOCAL_PLAYER;
	}
}
