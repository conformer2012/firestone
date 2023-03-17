export interface BgsMetaHeroStatTier {
	readonly id: BgsHeroTier;
	readonly label: string;
	readonly tooltip: string;
	readonly items: readonly BgsMetaHeroStatTierItem[];
}

export interface BgsMetaHeroStatTierItem {
	readonly id: string;
	readonly dataPoints: number;
	readonly averagePosition: number;
	readonly positionTribesModifier: number;
	readonly placementDistribution: readonly { rank: number; percentage: number }[];
	readonly placementDistributionImpact: readonly { rank: number; percentage: number }[];
	readonly combatWinrate: readonly { turn: number; winrate: number }[];
	readonly combatWinrateImpact: readonly { turn: number; winrate: number }[];
	readonly warbandStats: readonly { turn: number; averageStats: number }[];
	readonly warbandStatsImpact: readonly { turn: number; averageStats: number }[];

	// Enhanced to make it easier to use
	readonly name: string;
	readonly baseCardId: string;
	readonly heroPowerCardId: string;
	readonly top1: number;
	readonly top4: number;

	readonly tier?: BgsHeroTier;

	// Enhanced with player data
	readonly playerDataPoints?: number;
	readonly playerAveragePosition?: number;
	readonly playerNetMmr?: number;
	readonly playerPlacementDistribution?: readonly { rank: number; percentage: number }[];
	readonly playerAverageMmrGain?: number;
	readonly playerAverageMmrLoss?: number;
	readonly playerLastPlayedTimestamp?: number;
	readonly playerTop1?: number;
	readonly playerTop4?: number;
}

export type BgsHeroTier = 'S' | 'A' | 'B' | 'C' | 'D' | 'E';