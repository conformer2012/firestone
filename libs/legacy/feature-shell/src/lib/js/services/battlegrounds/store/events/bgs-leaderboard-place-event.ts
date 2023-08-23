import { BattlegroundsStoreEvent } from './_battlegrounds-store-event';

export class BgsLeaderboardPlaceEvent extends BattlegroundsStoreEvent {
	constructor(
		public readonly heroCardId: string,
		public readonly playerId: number,
		public readonly leaderboardPlace: number,
	) {
		super('BgsLeaderboardPlaceEvent');
	}
}
