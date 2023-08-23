import { BattlegroundsStoreEvent } from './_battlegrounds-store-event';

export class BgsTavernUpgradeEvent extends BattlegroundsStoreEvent {
	constructor(
		public readonly heroCardId: string,
		public readonly playerId: number,
		public readonly tavernTier: number,
	) {
		super('BgsTavernUpgradeEvent');
	}
}
