import { Card } from '../card';
import { CardBack } from '../card-back';
import { CardHistory } from '../card-history';
import { Set, SetCard } from '../set';

export class BinderState {
	readonly collection: readonly Card[] = [];
	readonly allSets: readonly Set[] = [];
	readonly cardBacks: readonly CardBack[] = [];
	readonly cardHistory: readonly CardHistory[] = [];
	readonly totalHistoryLength: number;
	readonly isLoading: boolean = true;

	public getCard(cardId: string): SetCard {
		return this.allSets.map(set => set.getCard(cardId)).find(card => card);
	}

	public getAllCards(): readonly SetCard[] {
		return this.allSets.map(set => set.allCards).reduce((a, b) => a.concat(b), []);
	}
}
