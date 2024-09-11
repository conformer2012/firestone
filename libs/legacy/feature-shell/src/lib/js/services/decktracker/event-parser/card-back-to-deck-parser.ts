import { CardIds, ReferenceCard } from '@firestone-hs/reference-data';
import { DeckCard, DeckState, GameState } from '@firestone/game-state';
import { CardsFacadeService } from '@firestone/shared/framework/core';
import { GameEvent } from '../../../models/game-event';
import { forcedHiddenCardCreators } from '../../hs-utils';
import { LocalizationFacadeService } from '../../localization-facade.service';
import { DeckManipulationHelper } from './deck-manipulation-helper';
import { EventParser } from './event-parser';

const CARD_SENDING_TO_BOTTOM = [
	CardIds.BootstrapSunkeneer,
	CardIds.SirFinleySeaGuide,
	CardIds.PhasingPortal,
	CardIds.ForgottenDepthsTavernBrawl,
	CardIds.Drown,
];
const CARD_SENDING_TO_TOP = [CardIds.EnvoyOfProsperity_WORK_031];
export class CardBackToDeckParser implements EventParser {
	constructor(
		private readonly helper: DeckManipulationHelper,
		private readonly allCards: CardsFacadeService,
		private readonly i18n: LocalizationFacadeService,
	) {}

	applies(gameEvent: GameEvent, state: GameState): boolean {
		return !!state;
	}

	async parse(currentState: GameState, gameEvent: GameEvent): Promise<GameState> {
		const [initialCardId, controllerId, localPlayer, entityId] = gameEvent.parse();
		const initialZone: string = gameEvent.additionalData.initialZone;
		const isPlayer = controllerId === localPlayer.PlayerId;

		// Hack
		const cardId =
			!isPlayer && forcedHiddenCardCreators.includes(gameEvent.additionalData.influencedByCardId)
				? null
				: initialCardId;
		const deck = isPlayer ? currentState.playerDeck : currentState.opponentDeck;
		const card = this.findCard(initialZone, deck, cardId, entityId);
		console.debug('[card-back-to-deck] found card', card, cardId, entityId, initialZone, deck);

		const newHand: readonly DeckCard[] = this.buildNewHand(initialZone, deck.hand, card);
		const newBoard: readonly DeckCard[] = this.buildNewBoard(initialZone, deck.board, card);
		const newOther: readonly DeckCard[] = this.buildNewOther(initialZone, deck.otherZone, card);
		const previousDeck = deck.deck;
		// When we have a deckstring / decklist, we show all the possible remaining options in the
		// decklist. This means that when a filler card goes back, it's one of these initial cards
		// that goes back, and so we don't add them once again
		const shouldKeepDeckAsIs = deck.deckstring && (card?.inInitialDeck || !card?.creatorCardId) && !card?.cardId;
		console.debug(
			'[card-back-to-deck] shouldKeepDeckAsIs',
			shouldKeepDeckAsIs,
			card?.inInitialDeck,
			card?.cardId,
			deck,
			card,
			gameEvent,
		);

		// When a card is sent back to deck (but NOT when it is traded - see card-traded parser), we reset
		// the enchantments, cost reduction, etc.
		const refCard = this.allCards.getCard(card.cardId);
		const cardWithInfoReset = card?.update({
			// Otherwise the cost goes back to 0
			manaCost:
				(card.cardId?.startsWith(CardIds.ZilliaxDeluxe3000_TOY_330) ? card.manaCost : refCard?.cost) ??
				card?.manaCost,
			actualManaCost:
				(card.cardId?.startsWith(CardIds.ZilliaxDeluxe3000_TOY_330) ? card.manaCost : refCard?.cost) ??
				card?.manaCost,
			buffCardIds: [],
			buffingEntityCardIds: [],
			entityId: Math.abs(card.entityId),
			// For tidepool pupil / Sivara / etc. Once a a card is moved back to the deck, its info is reset
			relatedCardIds: [],
			// linkedEntityIds: [],
		});
		// This is to avoid the scenario where a card is drawn by a public influence (eg Thistle Tea) and
		// put back in the deck, then drawn again. If we don't reset the lastInfluencedBy, we
		// could possibly have an info leak
		const cardWithoutInfluence = cardWithInfoReset?.update({
			entityId: cardWithInfoReset.entityId,
			lastAffectedByCardId: undefined,
			positionFromTop: undefined,
			positionFromBottom: undefined,
			dredged: undefined,
			temporaryCard: false,
			zone: undefined,
		} as DeckCard);
		console.debug('[card-back-to-deck] cardWithoutInfluence', cardWithoutInfluence, cardWithInfoReset);
		const cardWithInfluenceBack = cardWithoutInfluence?.update({
			lastAffectedByCardId: gameEvent.additionalData.influencedByCardId,
		});
		const cardWithPosition = CARD_SENDING_TO_BOTTOM.includes(gameEvent.additionalData.influencedByCardId)
			? cardWithInfluenceBack.update({
					positionFromBottom: DeckCard.deckIndexFromBottom++,
			  })
			: CARD_SENDING_TO_TOP.includes(gameEvent.additionalData.influencedByCardId)
			? cardWithInfluenceBack.update({
					positionFromTop: 0,
			  })
			: cardWithInfluenceBack;
		const newDeck: readonly DeckCard[] = shouldKeepDeckAsIs
			? previousDeck
			: this.helper.addSingleCardToZone(previousDeck, cardWithPosition);

		const newPlayerDeck = Object.assign(new DeckState(), deck, {
			deck: newDeck,
			hand: newHand,
			board: newBoard,
			otherZone: newOther,
		} as DeckState);
		return Object.assign(new GameState(), currentState, {
			[isPlayer ? 'playerDeck' : 'opponentDeck']: newPlayerDeck,
		});
	}

	event(): string {
		return GameEvent.CARD_BACK_TO_DECK;
	}

	private findCard(initialZone: string, deckState: DeckState, cardId: string, entityId: number): DeckCard {
		let result = null;
		if (initialZone === 'HAND') {
			result = this.helper.findCardInZone(deckState.hand, cardId, entityId);
		} else if (initialZone === 'PLAY') {
			result = this.helper.findCardInZone(deckState.board, cardId, entityId);
		} else if (['GRAVEYARD', 'REMOVEDFROMGAME', 'SETASIDE', 'SECRET'].indexOf(initialZone) !== -1) {
			result = this.helper.findCardInZone(deckState.otherZone, cardId, entityId);
		}
		// console.warn('could not find card in card-back-to-deck', initialZone, cardId, deckState);

		const dbCard = (cardId && this.allCards.getCard(cardId)) || ({} as ReferenceCard);
		return (
			result ??
			DeckCard.create({
				cardId: cardId,
				entityId: entityId,
				cardName: this.i18n.getCardName(dbCard.id),
				manaCost: dbCard.cost,
				rarity: dbCard.rarity ? dbCard.rarity.toLowerCase() : null,
				playTiming: null,
			} as DeckCard)
		);
	}

	private buildNewHand(
		initialZone: string,
		previousHand: readonly DeckCard[],
		movedCard: DeckCard,
	): readonly DeckCard[] {
		if (initialZone !== 'HAND' || !movedCard) {
			return previousHand;
		}
		return this.helper.removeSingleCardFromZone(previousHand, movedCard.cardId, movedCard.entityId)[0];
	}

	private buildNewOther(
		initialZone: string,
		previousOther: readonly DeckCard[],
		movedCard: DeckCard,
	): readonly DeckCard[] {
		if (['GRAVEYARD', 'REMOVEDFROMGAME', 'SETASIDE', 'SECRET'].indexOf(initialZone) !== -1 || !movedCard) {
			return this.helper.removeSingleCardFromZone(previousOther, movedCard.cardId, movedCard.entityId)[0];
		}
		return previousOther;
	}

	private buildNewBoard(
		initialZone: string,
		previousBOard: readonly DeckCard[],
		movedCard: DeckCard,
	): readonly DeckCard[] {
		if (initialZone !== 'PLAY' || !movedCard) {
			return previousBOard;
		}
		return this.helper.removeSingleCardFromZone(previousBOard, movedCard.cardId, movedCard.entityId)[0];
	}
}
