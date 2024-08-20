import { BoosterType } from '@firestone-hs/reference-data';

export const EXCLUDED_BOOSTER_IDS = [
	BoosterType.INVALID,
	BoosterType.SIGNUP_INCENTIVE,
	BoosterType.FIRST_PURCHASE,
	BoosterType.FIRST_PURCHASE_OLD,
	BoosterType.MAMMOTH_BUNDLE,
	BoosterType.WAILING_CAVERNS,
	BoosterType.PATH_OF_ARTHAS,
];

export const GOLDEN_SET_PACKS = [
	BoosterType.GOLDEN_SCHOLOMANCE,
	BoosterType.GOLDEN_DARKMOON_FAIRE,
	BoosterType.GOLDEN_THE_BARRENS,
	BoosterType.STORMWIND_GOLDEN,
	BoosterType.GOLDEN_THE_SUNKEN_CITY,
	BoosterType.ALTERAC_VALLEY_GOLDEN,
	BoosterType.GOLDEN_REVENDRETH,
	BoosterType.GOLDEN_RETURN_OF_THE_LICH_KING,
	BoosterType.GOLDEN_BATTLE_OF_THE_BANDS,
	BoosterType.GOLDEN_TITANS,
	BoosterType.GOLDEN_CAVERNS_OF_TIME,
	BoosterType.GOLDEN_WILD_WEST,
	BoosterType.GOLDEN_WHIZBANGS_WORKSHOP,
	BoosterType.GOLDEN_ISLAND_VACATION,
];

export const CLASS_PACKS = [
	BoosterType.STANDARD_DEATHKNIGHT,
	BoosterType.STANDARD_DEMONHUNTER,
	BoosterType.STANDARD_DRUID,
	BoosterType.STANDARD_HUNTER,
	BoosterType.STANDARD_MAGE,
	BoosterType.STANDARD_PALADIN,
	BoosterType.STANDARD_PRIEST,
	BoosterType.STANDARD_ROGUE,
	BoosterType.STANDARD_SHAMAN,
	BoosterType.STANDARD_WARRIOR,
	BoosterType.STANDARD_WARLOCK,
];

export const YEAR_PACKS = [BoosterType.YEAR_OF_DRAGON, BoosterType.YEAR_OF_PHOENIX];

export const NON_BUYABLE_BOOSTER_IDS = [
	...GOLDEN_SET_PACKS,
	...CLASS_PACKS,
	...YEAR_PACKS,
	BoosterType.GOLDEN_CLASSIC_PACK,
	BoosterType.GOLDEN_STANDARD_PACK,
	BoosterType.GOLDEN_WILD_PACK,
	BoosterType.GOLDEN_YEAR_OF_THE_PHOENIX,
];
export const SPECIAL_BOOSTER_IDS = [BoosterType.WHIZBANG_CATCH_UP, BoosterType.ISLAND_VACATION_CATCH_UP];
