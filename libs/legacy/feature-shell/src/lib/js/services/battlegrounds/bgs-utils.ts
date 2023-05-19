import {
	CardIds,
	GameTag,
	GameType,
	NON_BUYABLE_MINION_IDS,
	Race,
	ReferenceCard,
	SceneMode,
} from '@firestone-hs/reference-data';
import { Entity } from '@firestone-hs/replay-parser';
import { BgsBattleInfo } from '@firestone-hs/simulate-bgs-battle/dist/bgs-battle-info';
import { BgsBoardInfo } from '@firestone-hs/simulate-bgs-battle/dist/bgs-board-info';
import { BoardEntity } from '@firestone-hs/simulate-bgs-battle/dist/board-entity';
import { CardsFacadeService } from '@firestone/shared/framework/core';
import { StatGameModeType } from '@firestone/stats/data-access';
import { BattleInfoMessage } from '../../models/battlegrounds/battle-info-message.type';
import { VisualAchievement } from '../../models/visual-achievement';

/** @deprecated */
export const normalizeHeroCardId = (heroCardId: string, allCards: CardsFacadeService): string => {
	if (!heroCardId) {
		return heroCardId;
	}

	const normalizedAfterSkin = normalizeHeroCardIdAfterSkin(heroCardId, allCards);
	switch (normalizedAfterSkin) {
		case 'TB_BaconShop_HERO_59t':
			return 'TB_BaconShop_HERO_59';
		case CardIds.QueenAzshara_NagaQueenAzsharaToken:
			return CardIds.QueenAzshara_BG22_HERO_007;
		default:
			return normalizedAfterSkin;
	}
};

/** @deprecated */
const normalizeHeroCardIdAfterSkin = (heroCardId: string, allCards: CardsFacadeService): string => {
	const heroCard = allCards.getCard(heroCardId);
	if (!!heroCard?.battlegroundsHeroParentDbfId) {
		const parentCard = allCards.getCardFromDbfId(heroCard.battlegroundsHeroParentDbfId);
		if (!!parentCard) {
			return parentCard.id;
		}
	}
	// Fallback to regex
	const bgHeroSkinMatch = heroCardId.match(/(.*)_SKIN_.*/);
	if (bgHeroSkinMatch) {
		return bgHeroSkinMatch[1];
	}
	return heroCardId;
};

export const getAllCardsInGame = (
	availableTribes: readonly Race[],
	allCards: CardsFacadeService,
): readonly ReferenceCard[] => {
	const result = allCards
		.getCards()
		.filter((card) => card.techLevel)
		.filter((card) => card.set !== 'Vanilla')
		.filter((card) => !card.mechanics?.includes(GameTag[GameTag.BACON_BUDDY]))
		.filter((card) => !NON_BUYABLE_MINION_IDS.includes(card.id as CardIds))
		.filter((card) => {
			if (!availableTribes?.length) {
				return true;
			}
			const tribesForCard = getTribesForInclusion(card, false);
			if (!tribesForCard.filter((t) => t !== Race.BLANK).length) {
				return true;
			}
			return tribesForCard.some((r) => isValidTribe(availableTribes, Race[r]));
		})
		.filter((card) => !card.battlegroundsNormalDbfId); // Ignore golden
	return result;
};

const isValidTribe = (validTribes: readonly Race[], race: string): boolean => {
	const raceEnum: Race = Race[race];
	return (
		raceEnum === Race.ALL ||
		raceEnum === Race.BLANK ||
		!validTribes ||
		validTribes.length === 0 ||
		validTribes.includes(raceEnum)
	);
};

export const getTribesForInclusion = (card: ReferenceCard, includeOwnTribe: boolean): readonly Race[] => {
	if (!card) {
		return [];
	}
	const nativeRaces = card.races?.map((r) => Race[r]) ?? [];
	const cardRaces = includeOwnTribe ? nativeRaces : [];
	switch (card.id) {
		// Some cases are only included when specific tribes are
		case CardIds.BirdBuddy:
		case CardIds.BirdBuddyBattlegrounds:
		case CardIds.PackLeader:
		case CardIds.PackLeaderBattlegrounds:
		case CardIds.VirmenSensei:
		case CardIds.VirmenSenseiBattlegrounds:
		case CardIds.HoundmasterLegacy:
		case CardIds.HoundmasterVanilla:
		case CardIds.HoundmasterBattlegrounds:
		case CardIds.Houndmaster:
			return [Race.BEAST, ...cardRaces];
		case CardIds.ImpatientDoomsayer:
		case CardIds.ImpatientDoomsayerBattlegrounds:
		case CardIds.SoulJuggler:
		case CardIds.SoulJugglerBattlegrounds:
		case CardIds.WrathWeaver:
		case CardIds.WrathWeaverBattlegrounds:
			return [Race.DEMON, ...cardRaces];
		case CardIds.SeafoodSlinger:
		case CardIds.SeafoodSlingerBattlegrounds:
			return [Race.MURLOC, ...cardRaces];
		case CardIds.NadinaTheRed:
		case CardIds.NadinaTheRedBattlegrounds:
		case CardIds.WaxriderTogwaggle_BGS_035:
		case CardIds.WaxriderTogwaggleBattlegrounds:
		case CardIds.WhelpSmuggler:
		case CardIds.WhelpSmugglerBattlegrounds:
			return [Race.DRAGON, ...cardRaces];
		case CardIds.MajordomoExecutus_BGS_105:
		case CardIds.MajordomoExecutusBattlegrounds:
		case CardIds.MasterOfRealities_BG21_036:
		case CardIds.MasterOfRealitiesBattlegrounds:
		case CardIds.NomiKitchenNightmare:
		case CardIds.NomiKitchenNightmareBattlegrounds:
			return [Race.ELEMENTAL, ...cardRaces];
		case CardIds.KangorsApprentice:
		case CardIds.KangorsApprenticeBattlegrounds:
			return [Race.MECH, ...cardRaces];
		case CardIds.DefiantShipwright_BG21_018:
		case CardIds.DefiantShipwright_BG21_018_G:
		case CardIds.TheTideRazor:
		case CardIds.TheTideRazorBattlegrounds:
			return [Race.PIRATE, ...cardRaces];
		case CardIds.AgamagganTheGreatBoar:
		case CardIds.AgamagganTheGreatBoarBattlegrounds:
		case CardIds.ProphetOfTheBoar:
		case CardIds.ProphetOfTheBoarBattlegrounds:
			return [Race.QUILBOAR, ...cardRaces];
		case CardIds.OrgozoaTheTender:
		case CardIds.OrgozoaTheTenderBattlegrounds:
			return [Race.NAGA, ...cardRaces];
		// case CardIds.SindoreiStraightShot:
		// case CardIds.SindoreiStraightShotBattlegrounds:
		// 	return [Race.UNDEAD, ...cardRaces];
		default:
			return getEffectiveTribesEnum(card);
	}
};

export const getEffectiveTribes = (
	card: ReferenceCard,
	groupMinionsIntoTheirTribeGroup: boolean,
): readonly string[] => {
	const tribes: readonly Race[] = groupMinionsIntoTheirTribeGroup
		? getTribesForInclusion(card, true)
		: getEffectiveTribesEnum(card);
	return tribes.map((tribe) => Race[tribe]);
};

export const getEffectiveTribesEnum = (card: ReferenceCard): readonly Race[] => {
	return !!card.races?.length ? card.races.map((r) => Race[r]) : [Race.BLANK];
};

export const tribeValueForSort = (tribe: string): number => {
	switch (tribe) {
		case Race[Race.BEAST]:
			return 1;
		case Race[Race.DEMON]:
			return 2;
		case Race[Race.DRAGON]:
			return 3;
		case Race[Race.ELEMENTAL]:
			return 4;
		case Race[Race.MECH]:
			return 5;
		case Race[Race.MURLOC]:
			return 6;
		case Race[Race.PIRATE]:
			return 7;
		case Race[Race.QUILBOAR]:
			return 8;
		case Race[Race.NAGA]:
			return 9;
		case Race[Race.UNDEAD]:
			return 10;
		case Race[Race.ALL]:
			return 100;
		case Race[Race.BLANK]:
			return 101;
	}
};

export const getAchievementsForHero = (
	heroCardId: string,
	heroAchievements: readonly VisualAchievement[],
	allCards: CardsFacadeService,
): readonly VisualAchievement[] => {
	const dbHero = allCards.getCard(heroCardId);
	const heroName = formatHeroNameForAchievements(dbHero);
	const sectionId = getAchievementSectionIdFromHeroCardId(heroCardId, heroName);
	if (!!sectionId) {
		return (heroAchievements ?? []).filter((ach) => ach.hsSectionId === sectionId);
	}

	if (!heroName) {
		return [];
	}
	// Doesn't work with localized data, but we should never be in that situation
	console.warn('missing section id for', heroCardId, heroName);
	const searchName = `as ${heroName}`;
	const result = (heroAchievements ?? []).filter((ach) => ach.text.replace(/,/g, '').includes(searchName));
	if (!result?.length) {
		console.warn('Could not load achievements for hero', heroCardId, searchName, heroAchievements);
	}
	return result;
};

const getAchievementSectionIdFromHeroCardId = (heroCardId: string, heroName: string): number => {
	switch (heroCardId) {
		case CardIds.EdwinVancleefBattlegrounds:
			return 227;
		case CardIds.GalakrondBattlegrounds:
			return 231;
		case CardIds.IllidanStormrageBattlegrounds:
			return 234;
		case CardIds.RagnarosTheFirelordBattlegrounds:
			return 254;
		case CardIds.TheRatKingBattlegrounds:
			return 266;
		case CardIds.QueenWagtoggleBattlegrounds:
			return 253;
		case CardIds.GeorgeTheFallenBattlegrounds:
			return 232;
		case CardIds.AFKayBattlegrounds:
			return 215;
		case CardIds.MillificentManastormBattlegrounds:
			return 244;
		case CardIds.PatchesThePirateBattlegrounds:
			return 250;
		case CardIds.TheGreatAkazamzarakBattlegrounds:
			return 264;
		case CardIds.TheLichKingBattlegrounds:
			return 265;
		case CardIds.ShudderwockBattlegrounds:
			return 257;
		case CardIds.LichBazhialBattlegrounds:
			return 238;
		case CardIds.SindragosaBattlegrounds:
			return 259;
		case CardIds.InfiniteTokiBattlegrounds:
			return 235;
		case CardIds.TheCuratorBattlegrounds:
			return 263;
		case CardIds.PatchwerkBattlegrounds:
			return 251;
		case CardIds.YoggSaronHopesEndBattlegrounds:
			return 269;
		case CardIds.DancinDerylBattlegrounds:
			return 225;
		case CardIds.LordJaraxxusBattlegrounds:
			return 240;
		case CardIds.KingMuklaBattlegrounds:
			return 246;
		case CardIds.PyramadBattlegrounds:
			return 252;
		case CardIds.SirFinleyMrrggltonBattlegrounds:
			return 260;
		case CardIds.RenoJacksonBattlegrounds:
			return 256;
		case CardIds.EliseStarseekerBattlegrounds:
			return 228;
		case CardIds.DinotamerBrannBattlegrounds:
			return 220;
		case CardIds.ArchVillainRafaamBattlegrounds:
			return 219;
		case CardIds.MillhouseManastormBattlegrounds:
			return 243;
		case CardIds.TessGreymaneBattlegrounds:
			return 262;
		case CardIds.DeathwingBattlegrounds:
			return 226;
		case CardIds.YseraBattlegrounds:
			return 270;
		case CardIds.FungalmancerFlurglBattlegrounds:
			return 230;
		case CardIds.AlexstraszaBattlegrounds:
			return 217;
		case CardIds.NozdormuBattlegrounds:
			return 248;
		case CardIds.MalygosBattlegrounds:
			return 242;
		case CardIds.ArannaStarseekerBattlegrounds:
		case CardIds.ArannaStarseeker_ArannaUnleashedTokenBattlegrounds:
			return 218;
		case CardIds.KaelthasSunstriderBattlegrounds:
			return 237;
		case CardIds.MaievShadowsongBattlegrounds:
			return 241;
		case CardIds.CaptainEudoraBattlegrounds:
			return 222;
		case CardIds.CaptainHooktuskBattlegrounds:
			return 223;
		case CardIds.SkycapnKraggBattlegrounds:
			return 261;
		case CardIds.MrBigglesworthBattlegrounds:
			return 245;
		case CardIds.JandiceBarovBattlegrounds:
			return 236;
		case CardIds.LordBarovBattlegrounds:
			return 239;
		case CardIds.ForestWardenOmuBattlegrounds:
			return 229;
		case CardIds.ChenvaalaBattlegrounds:
			return 224;
		case CardIds.RakanishuBattlegrounds:
			return 255;
		case CardIds.AlakirBattlegrounds:
			return 216;
		case CardIds.ZephrysTheGreatBattlegrounds:
			return 271;
		case CardIds.SilasDarkmoonBattlegrounds:
			return 258;
		case CardIds.CthunBattlegrounds:
			return 221;
		case CardIds.NzothBattlegrounds:
			return 247;
		case CardIds.YshaarjBattlegrounds:
			return 268;
		case CardIds.TickatusBattlegrounds:
			return 267;
		case CardIds.GreyboughBattlegrounds:
			return 233;
		case CardIds.OverlordSaurfang_BG20_HERO_102:
			return 249;
		case CardIds.DeathSpeakerBlackthorn_BG20_HERO_103:
			return 275;
		case CardIds.Voljin_BG20_HERO_201:
			return 276;
		case CardIds.Xyrella_BG20_HERO_101:
			return 274;
		case CardIds.MutanusTheDevourer_BG20_HERO_301:
			return 281;
		case CardIds.GuffRunetotem_BG20_HERO_242:
			return 282;
		case CardIds.KurtrusAshfallen_BG20_HERO_280:
			return 307;
		case CardIds.Galewing:
			return 321;
		case CardIds.TradePrinceGallywixBattlegrounds:
			return 308;
		case CardIds.MasterNguyen:
			return 326;
		case CardIds.CarielRoame_BG21_HERO_000:
			return 325;
		case CardIds.Sneed_BG21_HERO_030:
			return 366;
		case CardIds.CookieTheCook_BG21_HERO_020:
			return 367;
		case CardIds.TamsinRoame_BG20_HERO_282:
			return 369;
		case CardIds.ScabbsCutterbutter_BG21_HERO_010:
			return 371;
		case CardIds.Brukan_BG22_HERO_001:
			return 372;
		case CardIds.Drekthar_BG22_HERO_002:
			// There is also a 376 for Duels, don't mix them up!
			return 373;
		case CardIds.VanndarStormpike_BG22_HERO_003:
			// There is also a 375 for Duels, don't mix them up!
			return 374;
		case CardIds.TavishStormpike_BG22_HERO_000:
			return 370;
		case CardIds.VardenDawngrasp_BG22_HERO_004:
			return 380;
		case CardIds.Rokara_BG20_HERO_100:
			return 381;
		case CardIds.Onyxia_BG22_HERO_305:
			return 379;
		case CardIds.AmbassadorFaelin_BG22_HERO_201:
			return 394;
		case CardIds.IniStormcoil_BG22_HERO_200:
			return 401;
		case CardIds.QueenAzshara_BG22_HERO_007:
			return 406;
		case CardIds.Ozumat_BG23_HERO_201:
			return 407;
		case CardIds.LadyVashj_BG23_HERO_304:
			return 410;
		case CardIds.HeistbaronTogwaggle_BG23_HERO_305:
			return 425;
		case CardIds.MurlocHolmes_BG23_HERO_303:
			return 426;
		case CardIds.SireDenathrius_BG24_HERO_100:
			return 427;
		case CardIds.SylvanasWindrunner_BG23_HERO_306:
			return 431;
		case CardIds.TheJailerBattlegrounds:
			return 459;
		case CardIds.EnhanceOMechano_BG24_HERO_204:
			return 462;
		case CardIds.ProfessorPutricide_BG25_HERO_100:
			return 463;
		case CardIds.TeronGorefiend_BG25_HERO_103:
			return 464;
		case CardIds.ETCBandManager_BG25_HERO_105:
			return 478;
		case CardIds.RockMasterVoone_BG26_HERO_104:
			return 481;
		default:
			if (heroCardId !== CardIds.Diablo) {
				console.error('missing achievements section for ', heroCardId);
			}
			return null;
	}
};

export const getBuddy = (heroCardId: CardIds, allCards: CardsFacadeService): CardIds => {
	switch (normalizeHeroCardId(heroCardId, allCards)) {
		case CardIds.AFKayBattlegrounds:
			return CardIds.SnackVendorBattlegrounds_TB_BaconShop_HERO_16_Buddy;
		case CardIds.AlakirBattlegrounds:
			return CardIds.SpiritOfAirBattlegrounds_TB_BaconShop_HERO_76_Buddy;
		case CardIds.AlexstraszaBattlegrounds:
			return CardIds.VaelastraszBattlegrounds_TB_BaconShop_HERO_56_Buddy;
		case CardIds.ArannaStarseeker_ArannaUnleashedTokenBattlegrounds:
		case CardIds.ArannaStarseekerBattlegrounds:
			return CardIds.SklibbDemonHunterBattlegrounds_TB_BaconShop_HERO_59_Buddy;
		case CardIds.ArchVillainRafaamBattlegrounds:
			return CardIds.LoyalHenchmanBattlegrounds_TB_BaconShop_HERO_45_Buddy;
		case CardIds.Brukan_BG22_HERO_001:
			return CardIds.SpiritRaptor;
		case CardIds.CaptainEudoraBattlegrounds:
			return CardIds.DagwikStickytoeBattlegrounds_TB_BaconShop_HERO_64_Buddy;
		case CardIds.CaptainHooktuskBattlegrounds:
			return CardIds.RagingContenderBattlegrounds_TB_BaconShop_HERO_67_Buddy;
		case CardIds.CarielRoame_BG21_HERO_000:
			return CardIds.CaptainFairmount;
		case CardIds.ChenvaalaBattlegrounds:
			return CardIds.SnowElementalBattlegrounds_TB_BaconShop_HERO_78_Buddy;
		case CardIds.CookieTheCook_BG21_HERO_020:
			return CardIds.SousChef;
		case CardIds.CthunBattlegrounds:
			return CardIds.TentacleOfCthunBattlegrounds_TB_BaconShop_HERO_29_Buddy;
		case CardIds.DancinDerylBattlegrounds:
			return CardIds.AsherTheHaberdasherBattlegrounds_TB_BaconShop_HERO_36_Buddy;
		case CardIds.DeathSpeakerBlackthorn_BG20_HERO_103:
			return CardIds.DeathsHeadSage;
		case CardIds.DeathwingBattlegrounds:
			return CardIds.LadySinestraBattlegrounds_TB_BaconShop_HERO_52_Buddy;
		case CardIds.DinotamerBrannBattlegrounds:
			return CardIds.BrannsEpicEggBattlegrounds_TB_BaconShop_HERO_43_Buddy;
		case CardIds.Drekthar_BG22_HERO_002:
			return CardIds.FrostwolfLieutenant;
		case CardIds.EdwinVancleefBattlegrounds:
			return CardIds.Si7ScoutBattlegrounds_TB_BaconShop_HERO_01_Buddy;
		case CardIds.EliseStarseekerBattlegrounds:
			return CardIds.JrNavigatorBattlegrounds_TB_BaconShop_HERO_42_Buddy;
		case CardIds.ForestWardenOmuBattlegrounds:
			return CardIds.EvergreenBotaniBattlegrounds_TB_BaconShop_HERO_74_Buddy;
		case CardIds.FungalmancerFlurglBattlegrounds:
			return CardIds.SparkfinSoothsayerBattlegrounds_TB_BaconShop_HERO_55_Buddy;
		case CardIds.GalakrondBattlegrounds:
			return CardIds.ApostleOfGalakrondBattlegrounds_TB_BaconShop_HERO_02_Buddy;
		case CardIds.Galewing:
			return CardIds.FlightTrainer;
		case CardIds.GeorgeTheFallenBattlegrounds:
			return CardIds.KarlTheLostBattlegrounds_TB_BaconShop_HERO_15_Buddy;
		case CardIds.GreyboughBattlegrounds:
			return CardIds.WanderingTreantBattlegrounds_TB_BaconShop_HERO_95_Buddy;
		case CardIds.GuffRunetotem_BG20_HERO_242:
			return CardIds.BabyKodo;
		case CardIds.IllidanStormrageBattlegrounds:
			return CardIds.EclipsionIllidariBattlegrounds_TB_BaconShop_HERO_08_Buddy;
		case CardIds.InfiniteTokiBattlegrounds:
			return CardIds.ClockworkAssistantBattlegrounds_TB_BaconShop_HERO_28_Buddy;
		case CardIds.JandiceBarovBattlegrounds:
			return CardIds.JandicesApprenticeBattlegrounds_TB_BaconShop_HERO_71_Buddy;
		case CardIds.KaelthasSunstriderBattlegrounds:
			return CardIds.CrimsonHandCenturionBattlegrounds_TB_BaconShop_HERO_60_Buddy;
		case CardIds.KingMuklaBattlegrounds:
			return CardIds.CrazyMonkeyBattlegrounds_TB_BaconShop_HERO_38_Buddy;
		case CardIds.KurtrusAshfallen_BG20_HERO_280:
			return CardIds.LivingNightmare;
		case CardIds.LichBazhialBattlegrounds:
			return CardIds.UnearthedUnderlingBattlegrounds_TB_BaconShop_HERO_25_Buddy;
		case CardIds.LordBarovBattlegrounds:
			return CardIds.BarovsApprenticeBattlegrounds_TB_BaconShop_HERO_72_Buddy;
		case CardIds.LordJaraxxusBattlegrounds:
			return CardIds.KilrekBattlegrounds_TB_BaconShop_HERO_37_Buddy;
		case CardIds.MaievShadowsongBattlegrounds:
			return CardIds.ShadowWardenBattlegrounds_TB_BaconShop_HERO_62_Buddy;
		case CardIds.MalygosBattlegrounds:
			return CardIds.NexusLordBattlegrounds_TB_BaconShop_HERO_58_Buddy;
		case CardIds.MasterNguyen:
			return CardIds.LeiFlamepaw_BG20_HERO_202_Buddy;
		case CardIds.MillhouseManastormBattlegrounds:
			return CardIds.MagnusManastormBattlegrounds_TB_BaconShop_HERO_49_Buddy;
		case CardIds.MillificentManastormBattlegrounds:
			return CardIds.ElementiumSquirrelBombBattlegrounds_TB_BaconShop_HERO_17_Buddy;
		case CardIds.MrBigglesworthBattlegrounds:
			return CardIds.LilKTBattlegrounds_TB_BaconShop_HERO_70_Buddy;
		case CardIds.MutanusTheDevourer_BG20_HERO_301:
			return CardIds.NightmareEctoplasm;
		case CardIds.NozdormuBattlegrounds:
			return CardIds.ChromieBattlegrounds_TB_BaconShop_HERO_57_Buddy;
		case CardIds.NzothBattlegrounds:
			return CardIds.BabyNzothBattlegrounds_TB_BaconShop_HERO_93_Buddy;
		case CardIds.OverlordSaurfang_BG20_HERO_102:
			return CardIds.DranoshSaurfang;
		case CardIds.PatchesThePirateBattlegrounds:
			return CardIds.TuskarrRaiderBattlegrounds_TB_BaconShop_HERO_18_Buddy;
		case CardIds.PatchwerkBattlegrounds:
			return CardIds.WeebominationBattlegrounds_TB_BaconShop_HERO_34_Buddy;
		case CardIds.PyramadBattlegrounds:
			return CardIds.TitanicGuardianBattlegrounds_TB_BaconShop_HERO_39_Buddy;
		case CardIds.QueenWagtoggleBattlegrounds:
			return CardIds.ElderTaggawagBattlegrounds_TB_BaconShop_HERO_14_Buddy;
		case CardIds.RagnarosTheFirelordBattlegrounds:
			return CardIds.LucifronBattlegrounds_TB_BaconShop_HERO_11_Buddy;
		case CardIds.RakanishuBattlegrounds:
			return CardIds.LanternTenderBattlegrounds_TB_BaconShop_HERO_75_Buddy;
		case CardIds.RenoJacksonBattlegrounds:
			return CardIds.SrTombDiverBattlegrounds_TB_BaconShop_HERO_41_Buddy;
		case CardIds.ScabbsCutterbutter_BG21_HERO_010:
			return CardIds.WardenThelwater_BG21_HERO_010_Buddy;
		case CardIds.ShudderwockBattlegrounds:
			return CardIds.MuckslingerBattlegrounds_TB_BaconShop_HERO_23_Buddy;
		case CardIds.SilasDarkmoonBattlegrounds:
			return CardIds.BurthBattlegrounds_TB_BaconShop_HERO_90_Buddy;
		case CardIds.SindragosaBattlegrounds:
			return CardIds.ThawedChampionBattlegrounds_TB_BaconShop_HERO_27_Buddy;
		case CardIds.SirFinleyMrrggltonBattlegrounds:
			return CardIds.MaxwellMightySteedBattlegrounds_TB_BaconShop_HERO_40_Buddy;
		case CardIds.SkycapnKraggBattlegrounds:
			return CardIds.SharkbaitBattlegrounds_TB_BaconShop_HERO_68_Buddy;
		case CardIds.Sneed_BG21_HERO_030:
			return CardIds.PilotedWhirlOTron;
		case CardIds.TamsinRoame_BG20_HERO_282:
			return CardIds.Monstrosity;
		case CardIds.TavishStormpike_BG22_HERO_000:
			return CardIds.Crabby_BG22_HERO_000_Buddy;
		case CardIds.TessGreymaneBattlegrounds:
			return CardIds.HunterOfOldBattlegrounds_TB_BaconShop_HERO_50_Buddy;
		case CardIds.TheCuratorBattlegrounds:
			return CardIds.MishmashBattlegrounds_TB_BaconShop_HERO_33_Buddy;
		case CardIds.TheGreatAkazamzarakBattlegrounds:
			return CardIds.StreetMagicianBattlegrounds_TB_BaconShop_HERO_21_Buddy;
		case CardIds.TheLichKingBattlegrounds:
			return CardIds.ArfusBattlegrounds_TB_BaconShop_HERO_22_Buddy;
		case CardIds.TheRatKingBattlegrounds:
			return CardIds.PigeonLordBattlegrounds_TB_BaconShop_HERO_12_Buddy;
		case CardIds.TickatusBattlegrounds:
			return CardIds.TicketCollectorBattlegrounds_TB_BaconShop_HERO_94_Buddy;
		case CardIds.TradePrinceGallywixBattlegrounds:
			return CardIds.BilgewaterMogulBattlegrounds_TB_BaconShop_HERO_10_Buddy;
		case CardIds.VanndarStormpike_BG22_HERO_003:
			return CardIds.StormpikeLieutenant;
		case CardIds.Voljin_BG20_HERO_201:
			return CardIds.MasterGadrin;
		case CardIds.Xyrella_BG20_HERO_101:
			return CardIds.BabyElekk_BG20_HERO_101_Buddy;
		case CardIds.YoggSaronHopesEndBattlegrounds:
			return CardIds.AcolyteOfYoggSaronBattlegrounds_TB_BaconShop_HERO_35_Buddy;
		case CardIds.YseraBattlegrounds:
			return CardIds.ValithriaDreamwalkerBattlegrounds_TB_BaconShop_HERO_53_Buddy;
		case CardIds.YshaarjBattlegrounds:
			return CardIds.BabyYshaarjBattlegrounds_TB_BaconShop_HERO_92_Buddy;
		case CardIds.ZephrysTheGreatBattlegrounds:
			return CardIds.PhyreszBattlegrounds_TB_BaconShop_HERO_91_Buddy;
		case CardIds.VardenDawngrasp_BG22_HERO_004:
			return CardIds.VardensAquarrior;
		case CardIds.Rokara_BG20_HERO_100:
			return CardIds.IcesnarlTheMighty;
		case CardIds.Onyxia_BG22_HERO_305:
			return CardIds.ManyWhelpsBattlegrounds;
		case CardIds.AmbassadorFaelin_BG22_HERO_201:
			return CardIds.SubmersibleChef;
		case CardIds.IniStormcoil_BG22_HERO_200:
			return CardIds.SubScrubber;
		case CardIds.QueenAzshara_BG22_HERO_007:
			return CardIds.ImperialDefender;
		case CardIds.Ozumat_BG23_HERO_201:
			return CardIds.Tamuzo;
		case CardIds.LadyVashj_BG23_HERO_304:
			return CardIds.CoilfangElite;
		case CardIds.HeistbaronTogwaggle_BG23_HERO_305:
			return CardIds.WaxadredTheDrippy;
		case CardIds.SireDenathrius_BG24_HERO_100:
			return CardIds.ShadyAristocrat;
		case CardIds.SylvanasWindrunner_BG23_HERO_306:
			return CardIds.NathanosBlightcaller_BG23_HERO_306_Buddy;
		case CardIds.TheJailerBattlegrounds:
			return CardIds.MawswornSoulkeeperBattlegrounds_TB_BaconShop_HERO_702_Buddy;
		case CardIds.EnhanceOMechano_BG24_HERO_204:
			return CardIds.EnhanceOMedico;
		case CardIds.ProfessorPutricide_BG25_HERO_100:
			return CardIds.Festergut_BG25_HERO_100_Buddy;
		case CardIds.TeronGorefiend_BG25_HERO_103:
			return CardIds.ShadowyConstruct;
		case CardIds.MurlocHolmes_BG23_HERO_303:
			return CardIds.Watfin;
		case CardIds.ETCBandManager_BG25_HERO_105:
			return CardIds.TalentScout;
		default:
			if (!!heroCardId) {
				console.error('missing buddy section for ', heroCardId);
			}
			return null;
	}
};

// Because inconsistencies
const formatHeroNameForAchievements = (hero: ReferenceCard): string => {
	switch (hero?.id) {
		case CardIds.MaievShadowsongBattlegrounds:
			return 'Maiev';
		case CardIds.KingMuklaBattlegrounds:
			return 'Mukla';
		case CardIds.DinotamerBrannBattlegrounds:
			return 'Brann';
		case CardIds.ArannaStarseekerBattlegrounds:
			return 'Aranna';
		case CardIds.RagnarosTheFirelordBattlegrounds:
			return 'Ragnaros';
		case CardIds.AFKayBattlegrounds:
			return 'A.F.Kay'; // No whitespace
		default:
			return hero?.name?.replace(/,/g, '');
	}
};

export const isSupportedScenario = (
	battleInfo: BgsBattleInfo,
): {
	isSupported: boolean;
	reason?: BattleInfoMessage;
} => {
	const playerSupport = isSupportedScenarioForPlayer(battleInfo.playerBoard);
	const oppSupport = isSupportedScenarioForPlayer(battleInfo.opponentBoard);
	const result = {
		isSupported: playerSupport.isSupported && oppSupport.isSupported,
		reason: playerSupport.reason ?? oppSupport.reason,
	};
	if (
		battleInfo.playerBoard?.player?.heroPowerId === CardIds.PrestidigitationBattlegrounds ||
		battleInfo.opponentBoard?.player?.heroPowerId === CardIds.PrestidigitationBattlegrounds
	) {
		console.log('[bgs-simulation] is supported?', result);
	}
	return result;
};

const isSupportedScenarioForPlayer = (
	boardInfo: BgsBoardInfo,
): {
	isSupported: boolean;
	reason?: BattleInfoMessage;
} => {
	try {
		if (hasScallywag(boardInfo) && (hasBaron(boardInfo) || hasKhadgar(boardInfo))) {
			return {
				isSupported: false,
				reason: 'scallywag',
			};
		} else if (hasPilotedWhirlOTron(boardInfo)) {
			return {
				isSupported: false,
				reason: 'piloted-whirl-o-tron',
			};
		} else if (hasMinions(boardInfo, [CardIds.RylakMetalhead, CardIds.RylakMetalheadBattlegrounds])) {
			return {
				isSupported: false,
				reason: 'rylak',
			};
		} else if (hasMinions(boardInfo, [CardIds.Bassgill, CardIds.BassgillBattlegrounds])) {
			return {
				isSupported: false,
				reason: 'bassgill',
			};
		} else if (hasMinions(boardInfo, [CardIds.ChoralMrrrglr, CardIds.ChoralMrrrglrBattlegrounds])) {
			return {
				isSupported: false,
				reason: 'choral-mrrrglr',
			};
		} else if (boardInfo?.secrets?.length > 0) {
			return {
				isSupported: false,
				reason: 'secret',
			};
		} else if (hasStreetMagician(boardInfo)) {
			return {
				isSupported: false,
				reason: 'secret',
			};
		}
		return {
			isSupported: true,
		};
	} catch (e) {
		console.error('[bgs-simularion] Error when parsing board', e);
		return {
			isSupported: false,
			reason: 'error',
		};
	}
};

const hasMinions = (boardInfo: BgsBoardInfo, cardIds: readonly CardIds[]) => {
	return cardIds.some((cardId) => hasMinionOnBoard(boardInfo, cardId));
};

const hasScallywag = (boardInfo: BgsBoardInfo) => {
	return (
		hasMinionOnBoard(boardInfo, CardIds.Scallywag) || hasMinionOnBoard(boardInfo, CardIds.ScallywagBattlegrounds)
	);
};

const hasPilotedWhirlOTron = (boardInfo: BgsBoardInfo) => {
	return (
		hasMinionOnBoard(boardInfo, CardIds.PilotedWhirlOTron) ||
		hasMinionOnBoard(boardInfo, CardIds.PilotedWhirlOTronBattlegrounds)
	);
};

const hasRylak = (boardInfo: BgsBoardInfo) => {
	return (
		hasMinionOnBoard(boardInfo, CardIds.RylakMetalhead) ||
		hasMinionOnBoard(boardInfo, CardIds.RylakMetalheadBattlegrounds)
	);
};

const hasBaron = (boardInfo: BgsBoardInfo) => {
	return (
		hasMinionOnBoard(boardInfo, CardIds.BaronRivendare_FP1_031) ||
		hasMinionOnBoard(boardInfo, CardIds.BaronRivendareBattlegrounds)
	);
};

const hasStreetMagician = (boardInfo: BgsBoardInfo) => {
	return (
		hasMinionOnBoard(boardInfo, CardIds.StreetMagicianBattlegrounds_TB_BaconShop_HERO_21_Buddy) ||
		hasMinionOnBoard(boardInfo, CardIds.StreetMagicianBattlegrounds_TB_BaconShop_HERO_21_Buddy_G)
	);
};

const hasKhadgar = (boardInfo: BgsBoardInfo) => {
	return (
		hasMinionOnBoard(boardInfo, CardIds.Khadgar_DAL_575) ||
		hasMinionOnBoard(boardInfo, CardIds.KhadgarBattlegrounds)
	);
};

const hasMinionOnBoard = (boardInfo: BgsBoardInfo, cardId: string): boolean => {
	if (!boardInfo?.board?.length) {
		return false;
	}

	return boardInfo.board.find((entity) => entity.cardId === cardId) != null;
};

export const buildEntityFromBoardEntity = (minion: BoardEntity, allCards: CardsFacadeService): Entity => {
	return Entity.fromJS({
		id: minion.entityId,
		cardID: minion.cardId,
		damageForThisAction: 0,
		tags: {
			[GameTag[GameTag.ATK]]: minion.attack,
			[GameTag[GameTag.HEALTH]]: minion.health,
			[GameTag[GameTag.TAUNT]]: minion.taunt ? 1 : 0,
			[GameTag[GameTag.STEALTH]]: minion.stealth ? 1 : 0,
			[GameTag[GameTag.DIVINE_SHIELD]]: minion.divineShield ? 1 : 0,
			[GameTag[GameTag.POISONOUS]]: minion.poisonous ? 1 : 0,
			[GameTag[GameTag.VENOMOUS]]: minion.venomous ? 1 : 0,
			[GameTag[GameTag.REBORN]]: minion.reborn ? 1 : 0,
			[GameTag[GameTag.WINDFURY]]: minion.windfury ? 1 : 0,
			[GameTag[GameTag.TAG_SCRIPT_DATA_NUM_1]]: minion.scriptDataNum1,
			[GameTag[GameTag.PREMIUM]]: allCards.getCard(minion.cardId)?.battlegroundsNormalDbfId ? 1 : 0,
		},
		// This probably won't work with positioning auras, but I don't think there are many
		// left (used to have Dire Wolf Alpha)
		enchantments: minion.enchantments,
	} as any);
};

/** @deprecated */
export const isBattlegrounds = (gameType: GameType | StatGameModeType): boolean => {
	return (
		[
			GameType.GT_BATTLEGROUNDS,
			GameType.GT_BATTLEGROUNDS_FRIENDLY,
			GameType.GT_BATTLEGROUNDS_AI_VS_AI,
			GameType.GT_BATTLEGROUNDS_PLAYER_VS_AI,
		].includes(gameType as GameType) ||
		['battlegrounds', 'battlegrounds-friendly'].includes(gameType as StatGameModeType)
	);
};

export const isBattlegroundsScene = (scene: SceneMode): boolean => {
	return [SceneMode.BACON].includes(scene);
};
