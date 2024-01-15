import { DeckState, GameState } from '@firestone/game-state';
import { DeckManipulationHelper } from '@services/decktracker/event-parser/deck-manipulation-helper';
import { GameEvent } from '../../../models/game-event';
import { EventParser } from './event-parser';

export class WeaponDestroyedParser implements EventParser {
	constructor(private readonly helper: DeckManipulationHelper) {}
	applies(gameEvent: GameEvent, state: GameState): boolean {
		return !!state;
	}

	async parse(currentState: GameState, gameEvent: GameEvent): Promise<GameState> {
		const [cardId, controllerId, localPlayer] = gameEvent.parse();
		const isPlayer = controllerId === localPlayer.PlayerId;
		const deck = isPlayer ? currentState.playerDeck : currentState.opponentDeck;
		// Sometimes the "weapon_equipped" event is fired before the "weapon_destroyed" one
		const updatedWeapon = deck.weapon?.update({
			zone: null,
			entityId: -deck.weapon.entityId,
		});
		const newOtherZone = !!updatedWeapon
			? this.helper.addSingleCardToZone(deck.otherZone, updatedWeapon)
			: deck.otherZone;
		const newPlayerDeck = deck.update({
			weapon: deck.weapon?.cardId === cardId ? null : deck.weapon,
			otherZone: newOtherZone,
		} as DeckState);
		return Object.assign(new GameState(), currentState, {
			[isPlayer ? 'playerDeck' : 'opponentDeck']: newPlayerDeck,
		});
	}

	event(): string {
		return GameEvent.WEAPON_DESTROYED;
	}
}
