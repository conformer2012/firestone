import { GameState } from '../../../../models/decktracker/game-state';
import { GameEvent } from '../../../../models/game-event';
import { EventParser } from '../event-parser';

export class CthunParser implements EventParser {
	applies(gameEvent: GameEvent, state: GameState): boolean {
		return !!state;
	}

	async parse(currentState: GameState, gameEvent: GameEvent): Promise<GameState> {
		const [, controllerId, localPlayer] = gameEvent.parse();
		const isPlayer = controllerId === localPlayer.PlayerId;
		const deck = isPlayer ? currentState.playerDeck : currentState.opponentDeck;
		const newPlayerDeck = deck.update({
			cthunAtk: gameEvent.additionalData.cthunAtk == null ? deck.cthunAtk : gameEvent.additionalData.cthunAtk,
			cthunHealth:
				gameEvent.additionalData.cthunHealth == null ? deck.cthunHealth : gameEvent.additionalData.cthunHealth,
		});
		return Object.assign(new GameState(), currentState, {
			[isPlayer ? 'playerDeck' : 'opponentDeck']: newPlayerDeck,
		});
	}

	event(): string {
		return GameEvent.CTHUN;
	}
}
