import { COIN_IDS, CardIds } from '@firestone-hs/reference-data';

export const giftCreators = [
	// For some reason the coin is flagged as created by the coin...
	...COIN_IDS,
	// CardIds.PhotographerFizzle,
	// CardIds.SirFinleySeaGuide, // Otherwise it flags all cards drawn as "create by Sir Finley"
	// CardIds.SymphonyOfSins, // Otherwise the info leaks when the opponent draws the card
	CardIds.AbyssalWave,
	CardIds.Acornbearer,
	CardIds.Acrobatics,
	CardIds.AdorableInfestation,
	CardIds.AirRaid_YOD_012,
	CardIds.ALightInTheDarkness,
	CardIds.ALightInTheDarkness_WON_333,
	CardIds.AmalgamOfTheDeep,
	CardIds.Amanthul,
	CardIds.AmitusThePeacekeeper_ReinforcedToken,
	CardIds.ApocalypseTavernBrawlToken,
	CardIds.ApothecaryHelbrim,
	CardIds.ArcaneBreath,
	CardIds.ArcaneBrilliance,
	CardIds.ArcaneQuiver_RLK_817,
	CardIds.ArcaneQuiver_RLK_Prologue_RLK_817,
	CardIds.ArcaneWyrm,
	CardIds.ArchdruidNaralex,
	CardIds.ArchmageAntonidas,
	CardIds.ArchmageAntonidasLegacy,
	CardIds.ArchmageAntonidasVanilla,
	CardIds.ArchmageArugal,
	CardIds.ArchmageStaff,
	CardIds.ArchmageStaffTavernBrawl,
	CardIds.ArchThiefRafaam,
	CardIds.ArchVillainRafaam_DAL_422,
	CardIds.Arcsplitter,
	CardIds.Arfus_CORE_ICC_854,
	CardIds.Arfus_ICC_854,
	CardIds.ArgusTheEmeraldStar_CrystalCarvingToken,
	CardIds.AstalorBloodsworn_AstalorTheProtectorToken,
	CardIds.AstalorBloodsworn,
	CardIds.AstralRift,
	CardIds.AthleticStudies_SCH_237,
	CardIds.AudioSplitter,
	CardIds.AwakeningTremors,
	CardIds.AwakenTheMakers,
	CardIds.AzsharanScroll_SunkenScrollToken,
	CardIds.AzsharanScroll,
	CardIds.AzsharanSweeper_TSC_776,
	CardIds.AzureExplorer,
	CardIds.BabblingBook,
	CardIds.BabblingBookCore,
	CardIds.BagOfCoins_LOOTA_836,
	CardIds.BagOfCoins_Story_11_BagofCoinsPuzzle,
	CardIds.BagOfCoinsTavernBrawl,
	CardIds.BananaBuffoon,
	CardIds.BananaramaTavernBrawl,
	CardIds.BaristaLynchen,
	CardIds.BarrelOfMonkeys_BarrelOfMonkeysToken_ETC_207t,
	CardIds.BarrelOfMonkeys,
	CardIds.BattleVicar,
	CardIds.BaubleOfBeetles_ULDA_307,
	CardIds.BazaarMugger,
	CardIds.BeOurGuestTavernBrawl,
	CardIds.BlastFromThePast_WON_115,
	CardIds.BlastWave,
	CardIds.BlessedGoods,
	CardIds.BlessingOfTheAncients_DAL_351,
	CardIds.BloodsailFlybooter,
	CardIds.BolnerHammerbeak, // In case a repeated battlecry draws / creates something
	CardIds.BookOfWonders,
	CardIds.BoomSquad_YOD_023,
	CardIds.Bottomfeeder,
	CardIds.BounceAroundFtGarona,
	CardIds.Breakdance,
	CardIds.Brightwing,
	CardIds.BrightwingLegacy,
	CardIds.BringOnRecruitsTavernBrawl,
	CardIds.BronzeExplorer,
	CardIds.BronzeExplorerCore,
	CardIds.BronzeHerald,
	CardIds.BronzeSignetTavernBrawl,
	CardIds.BubbleBlower,
	CardIds.BubbleBlowerTavernBrawl,
	CardIds.BuildASnowman_BuildASnowbruteToken,
	CardIds.BuildASnowman_BuildASnowgreToken,
	CardIds.BuildASnowman,
	CardIds.BumperCar,
	CardIds.BunchOfBananas_BunchOfBananasToken_ETC_201t,
	CardIds.BunchOfBananas,
	CardIds.Burgle_AT_033,
	CardIds.Burgle_WON_071,
	CardIds.BurglyBully,
	CardIds.CabalistsTome_WON_037,
	CardIds.CabalistsTome,
	CardIds.CalamitysGrasp,
	CardIds.CallOfTheGrave,
	CardIds.CallOfTheVoidLegacy,
	CardIds.CarrionStudies,
	CardIds.Castle,
	CardIds.CastleTavernBrawl,
	CardIds.CelestialProjectionist,
	CardIds.ChromieTimehopper_EscapeFromDurnholdeToken_WON_041t3,
	CardIds.ChromieTimehopper_OpeningTheDarkPortalToken_WON_041t,
	CardIds.CleverDisguise_ULD_328,
	CardIds.CloakOfEmeraldDreams_CloakOfEmeraldDreamsTavernBrawlEnchantment,
	CardIds.CloakOfEmeraldDreamsTavernBrawl,
	CardIds.ClockworkGnome,
	CardIds.CloningDevice,
	CardIds.CobaltSpellkin_DRG_075,
	CardIds.CommanderSivara_Story_11_Sivara,
	CardIds.CommanderSivara_TSC_087,
	CardIds.CommandTheElements_StormcallerBrukanToken,
	CardIds.CommandTheElements_TameTheFlamesToken, // Stormcaller Brukan
	CardIds.ConchsCall,
	CardIds.Concoctor,
	CardIds.ConfectionCyclone,
	CardIds.ConjureManaBiscuit,
	CardIds.ConjurersCalling_DAL_177,
	CardIds.ConnectionsTavernBrawl,
	CardIds.Convert,
	CardIds.Convert_WON_342,
	CardIds.CoppertailSnoop,
	CardIds.CorsairCache,
	CardIds.CreationProtocol_CreationProtocolToken,
	CardIds.CreationProtocol,
	CardIds.CrystallineOracle,
	CardIds.Cutpurse,
	CardIds.DarkPeddler_WON_096,
	CardIds.DarkPeddler,
	CardIds.DeathbringerSaurfangCore_RLK_082,
	CardIds.DeathstalkerRexxar_BuildABeast,
	CardIds.DeeprunEngineer,
	CardIds.DefendTheDwarvenDistrict_KnockEmDownToken, // For Tavish
	CardIds.DemonicDynamics,
	CardIds.DemonicStudies,
	CardIds.Dendrologist,
	CardIds.DesperateMeasures_DAL_141,
	CardIds.DevouringSwarm,
	CardIds.DevoutBlessingsTavernBrawlToken,
	CardIds.DiligentNotetaker,
	CardIds.DiscJockey,
	CardIds.DiscoveryOfMagic,
	CardIds.DispossessedSoul,
	CardIds.DivineIlluminationTavernBrawl,
	CardIds.Doomerang_CORE_ICC_233,
	CardIds.Doomerang_ICC_233,
	CardIds.DraconicLackey,
	CardIds.DraggedBelow,
	CardIds.DragonbaneShot,
	CardIds.DragonBreeder,
	CardIds.DragonqueenAlexstrasza,
	CardIds.DragonRoar_TRL_362,
	CardIds.DragonsHoard,
	CardIds.DrakonidOperative,
	CardIds.DrakonidOperativeCore,
	CardIds.DrBoomMadGenius_DeliveryDrone,
	CardIds.DroneDeconstructor,
	CardIds.DropletOfInsanityTavernBrawlToken,
	CardIds.DrygulchJailor,
	CardIds.Duplicate,
	CardIds.EarthenMight,
	CardIds.EerieStone_EerieStoneCostTavernBrawlEnchantment,
	CardIds.EerieStone_EerieStoneTavernBrawlEnchantment,
	CardIds.EerieStoneTavernBrawl,
	CardIds.EliteTaurenChampion_MoltenPickOfRockToken,
	CardIds.EliteTaurenChampion,
	CardIds.EliteTaurenChieftainLegacy,
	CardIds.EliteTaurenChieftainVanilla,
	CardIds.EmbraceOfNature_EmbraceOfNatureToken,
	CardIds.EmbraceOfNature,
	CardIds.EmeraldExplorer_DRG_313,
	CardIds.EncumberedPackMule,
	CardIds.EnergyShaper,
	CardIds.ETCBandManager_ETC_080,
	CardIds.ETCBandManager_SignANewArtist,
	CardIds.EtherealConjurer_CORE_LOE_003,
	CardIds.EtherealConjurer_LOE_003,
	CardIds.EtherealLackey,
	CardIds.EvilCableRat,
	CardIds.EvilConscripter,
	CardIds.EVILConscription,
	CardIds.EvilGenius,
	CardIds.EvilMiscreant,
	CardIds.EvilQuartermaster,
	CardIds.EvilTotem,
	CardIds.Evocation,
	CardIds.ExpiredMerchant,
	CardIds.ExplorersHat,
	CardIds.ExplorersHat_WON_022,
	CardIds.FalseDisciple,
	CardIds.FateSplitter,
	CardIds.FelerinTheForgotten,
	CardIds.Felosophy,
	CardIds.FelsoulJailer,
	CardIds.FelsoulJailerLegacy,
	CardIds.FiddlefireImp,
	CardIds.FightOverMe,
	CardIds.FinalShowdown_CloseThePortalToken, // Demonslayer Kurtrus
	CardIds.FindersKeepers,
	CardIds.FindTheImposter_MarkedATraitorToken, // Spymaster Scabbs
	CardIds.FindTheImposter_SpyOMaticToken,
	CardIds.FireFly,
	CardIds.FirePlumesHeart,
	CardIds.FiretreeWitchdoctor,
	CardIds.FirstDayOfSchool,
	CardIds.FirstFlame,
	CardIds.FirstWishTavernBrawl,
	CardIds.FishyFlyer,
	CardIds.FlameBehemoth,
	CardIds.FlameGeyser,
	CardIds.FlameGeyserCore,
	CardIds.FleshBehemoth_RLK_830,
	CardIds.FlightOfTheBronze,
	CardIds.Flowrider,
	CardIds.FontOfPower_BT_021,
	CardIds.ForTheAlliance_StandAsOneTavernBrawlToken,
	CardIds.ForTheHorde_PowerOfTheHordeTavernBrawlToken,
	CardIds.Framester,
	CardIds.FreshScent_YOD_005,
	CardIds.FrightenedFlunky,
	CardIds.FrightenedFlunkyCore,
	CardIds.FromTheScrapheap,
	CardIds.FrostShardsTavernBrawl,
	CardIds.FrostStrike,
	CardIds.FrostStrikeCore,
	CardIds.FrozenClone_CORE_ICC_082,
	CardIds.FrozenClone_ICC_082,
	CardIds.FrozenTouch_FrozenTouchToken,
	CardIds.FrozenTouch,
	CardIds.FullBlownEvil,
	CardIds.GalakrondsGuile,
	CardIds.GalakrondsWit,
	CardIds.GetawayKodo,
	CardIds.GhostWriter,
	CardIds.GiftOfTheOldGodsTavernBrawlToken,
	CardIds.GildedGargoyle_LOOT_534,
	CardIds.GoldenKobold,
	CardIds.GoldenScarab,
	CardIds.GorillabotA3,
	CardIds.GorillabotA3Core,
	CardIds.GraceOfTheHighfather,
	CardIds.GrandLackeyErkh,
	CardIds.GraveDefiler,
	CardIds.Griftah,
	CardIds.GrimestreetInformant_WON_331,
	CardIds.GrimestreetInformant,
	CardIds.Guidance_YOP_024,
	CardIds.GuitarSoloist,
	CardIds.HakkarTheSoulflayer_CorruptedBloodToken,
	CardIds.HalazziTheLynx,
	CardIds.Hallucination,
	CardIds.HarbingerOfWinterCore_RLK_511,
	CardIds.Harpoon,
	CardIds.HeadcrackLegacy,
	CardIds.HeadcrackVanilla,
	CardIds.HeistbaronTogwaggle_DAL_417,
	CardIds.Hematurge_RLK_066,
	CardIds.Hematurge_RLK_Prologue_066,
	CardIds.HenchClanBurglar_DAL_416,
	CardIds.HenchClanBurglarCore,
	CardIds.Hipster,
	CardIds.HornOfAncients,
	CardIds.HuntersPack,
	CardIds.Hydrologist,
	CardIds.IdentityTheft,
	CardIds.IgnisTheEternalFlame,
	CardIds.IKnowAGuy_WON_350,
	CardIds.IKnowAGuy,
	CardIds.IllidariStudies_YOP_001,
	CardIds.IllidariStudiesCore,
	CardIds.ImportPet_ImportPet,
	CardIds.ImportPet,
	CardIds.ImproveMorale,
	CardIds.IncriminatingPsychic,
	CardIds.InfernalStrikeTavernBrawl,
	CardIds.InfestedGoblin,
	CardIds.InfinitizeTheMaxitude_InfinitizeTheMaxitudeEnchantment,
	CardIds.InfinitizeTheMaxitude,
	CardIds.InFormation,
	CardIds.IvoryKnight_WON_045,
	CardIds.IvoryKnight,
	CardIds.IvoryRook_WON_116,
	CardIds.Jackpot,
	CardIds.JarDealer,
	CardIds.JerryRigCarpenter,
	CardIds.JeweledMacaw,
	CardIds.JeweledMacawCore,
	CardIds.JeweledScarab,
	CardIds.JourneyBelow_OG_072,
	CardIds.JungleGiants,
	CardIds.KabalChemist,
	CardIds.KabalCourier_WON_130,
	CardIds.KabalCourier,
	CardIds.KajamiteCreation,
	CardIds.Kalecgos_CORE_DAL_609,
	CardIds.Kalecgos_DAL_609,
	CardIds.Kalecgos_DAL_609,
	CardIds.Kalecgos_Story_07_Kalecgos,
	CardIds.KangorDancingKing,
	CardIds.Kazakus_CFM_621,
	CardIds.Kazakus_GreaterPotionToken,
	CardIds.Kazakus_LesserPotionToken,
	CardIds.Kazakus_SuperiorPotionToken,
	CardIds.KazakusGolemShaper,
	CardIds.KeywardenIvory,
	CardIds.KingMukla_CORE_EX1_014,
	CardIds.KingMuklaLegacy,
	CardIds.KingMuklaVanilla,
	CardIds.Kingsbane_LOOT_542,
	CardIds.KiriChosenOfElune,
	CardIds.KiriChosenOfEluneCore,
	CardIds.KoboldTaskmaster,
	CardIds.LadyDeathwhisper_RLK_713,
	CardIds.LakkariSacrifice,
	CardIds.LargeWaxyGiftTavernBrawl,
	CardIds.LesserRubySpellstone,
	CardIds.LicensedAdventurer,
	CardIds.LifebindersBloom,
	CardIds.LifebindersGift,
	CardIds.LightforgedBlessing_DAL_568,
	CardIds.LightningReflexes,
	CardIds.LivewireLance,
	CardIds.LoanShark,
	CardIds.LockAndLoad_AT_061,
	CardIds.LockAndLoad_CORE_AT_061,
	CardIds.LockAndLoad_WON_023,
	CardIds.Locuuuusts_ONY_005tb3,
	CardIds.Locuuuusts_ULDA_036,
	CardIds.LocuuuustsTavernBrawl,
	CardIds.LokenJailerOfYoggSaron,
	CardIds.LorewalkerCho,
	CardIds.LorewalkerChoLegacy,
	CardIds.LostInThePark_FeralFriendsyToken, // Guff the Tough
	CardIds.LotusAgents_WON_332,
	CardIds.LotusAgents,
	CardIds.LyraTheSunshard_CORE_UNG_963,
	CardIds.LyraTheSunshard_UNG_963,
	CardIds.MadameLazul,
	CardIds.Magicfin,
	CardIds.MagicTrick,
	CardIds.MailboxDancer,
	CardIds.MalygosAspectOfMagic,
	CardIds.MalygosTheSpellweaverCore,
	CardIds.ManaBind,
	CardIds.Mankrik,
	CardIds.MarkedShot,
	CardIds.MarkedShotCore,
	CardIds.Marshspawn_BT_115,
	CardIds.MarvelousMyceliumTavernBrawlToken,
	CardIds.MechagnomeGuide_MechagnomeGuideToken,
	CardIds.MechagnomeGuide,
	CardIds.MeetingStone,
	CardIds.Melomania_MelomaniaEnchantment,
	CardIds.MeltedMaker,
	CardIds.MenacingNimbus,
	CardIds.MenacingNimbusCore,
	CardIds.MerchSeller,
	CardIds.Metrognome,
	CardIds.MimironTheMastermind,
	CardIds.MindEater,
	CardIds.MindrenderIllucia,
	CardIds.MindVisionLegacy,
	CardIds.MindVisionVanilla,
	CardIds.MisterMukla_ETC_836,
	CardIds.Mixtape,
	CardIds.MoltenRune_MoltenRuneToken,
	CardIds.MoltenRune,
	CardIds.MoonbeastTavernBrawlToken,
	CardIds.MuckbornServant,
	CardIds.MuklaTyrantOfTheVale,
	CardIds.MurlocHolmes_REV_022,
	CardIds.MurlocHolmes_REV_770,
	CardIds.MurozondThiefOfTime_WON_066,
	CardIds.MuseumCurator_WON_056,
	CardIds.MuseumCurator,
	CardIds.MysteryWinner,
	CardIds.MysticalMirage_ULDA_035,
	CardIds.NatureStudies_SCH_333,
	CardIds.NecroticMortician,
	CardIds.Nefarian_BRM_030,
	CardIds.NellieTheGreatThresher_NelliesPirateShipToken,
	CardIds.Neptulon_GVG_042,
	CardIds.NerubianVizier,
	CardIds.NetherspiteHistorian,
	CardIds.Netherwalker,
	CardIds.NineLives,
	CardIds.OmegaAssembly,
	CardIds.OnyxMagescribe,
	CardIds.OpenTheDoorwaysTavernBrawl,
	CardIds.OpenTheWaygate,
	CardIds.OptimizedPolarityTavernBrawl,
	CardIds.PackKodo,
	CardIds.PalmReading,
	CardIds.PandarenImporter,
	CardIds.Paparazzi,
	CardIds.PeacefulPiper,
	CardIds.PebblyPage_WON_090,
	CardIds.Peon_BAR_022,
	CardIds.PharaohCat,
	CardIds.PhotographerFizzle_FizzlesSnapshotToken,
	CardIds.PilferLegacy,
	CardIds.PiranhaPoacher,
	CardIds.Plagiarizarrr,
	CardIds.PlantedEvidence,
	CardIds.PotionBelt,
	CardIds.PotionmasterPutricide,
	CardIds.PotionOfIllusion,
	CardIds.PowerChordSynchronize,
	CardIds.PowerOfCreation,
	CardIds.PozzikAudioEngineer,
	CardIds.Prestidigitation_DALA_BOSS_03p,
	CardIds.Prestidigitation_Prestidigitation,
	CardIds.PrimalfinLookout_UNG_937,
	CardIds.PrimordialGlyph,
	CardIds.PrimordialStudies_SCH_270,
	CardIds.PrismaticElemental,
	CardIds.PsychicConjurerCore,
	CardIds.PsychicConjurerLegacy,
	CardIds.Pyrotechnician,
	CardIds.QueenAzshara_TSC_641,
	CardIds.RaidNegotiator,
	CardIds.RaidTheDocks_SecureTheSuppliesToken,
	CardIds.RaiseDead_SCH_514,
	CardIds.RamCommander,
	CardIds.RamkahenWildtamer,
	CardIds.RapidFire_DAL_373,
	CardIds.RatsOfExtraordinarySize,
	CardIds.RatSensei_WON_013,
	CardIds.RavenIdol_Awakened,
	CardIds.RavenIdol_BreakFree,
	CardIds.RavenIdol,
	CardIds.RayOfFrost_DAL_577,
	CardIds.Reconnaissance,
	CardIds.RedcrestRocker,
	CardIds.RemixedDispenseOBot_ChillingDispenseOBotToken,
	CardIds.RemixedDispenseOBot_MerchDispenseOBotToken,
	CardIds.RemixedDispenseOBot_MoneyDispenseOBotToken,
	CardIds.RemixedDispenseOBot_MysteryDispenseOBotToken,
	CardIds.RemixedTuningFork_BackupTuningForkToken,
	CardIds.Renew_BT_252,
	CardIds.RenounceDarkness,
	CardIds.ResizingPouch,
	CardIds.Rewind_ETC_532,
	CardIds.Rhonin,
	CardIds.RiseToTheOccasion_AvengeTheFallenToken, // Lightborn Cariel
	CardIds.RisingWinds,
	CardIds.RockMasterVoone_ETC_121,
	CardIds.RunedOrb_BAR_541,
	CardIds.RunefueledGolem,
	CardIds.RunicAdornment,
	CardIds.RunicHelmTavernBrawl,
	CardIds.RuniTimeExplorer_ValdrakkenToken_WON_053t5,
	CardIds.RuniTimeExplorer_WON_053,
	CardIds.SandwaspQueen,
	CardIds.SaxophoneSoloist,
	CardIds.Schooling,
	CardIds.SchoolTeacher,
	CardIds.ScourgeIllusionist,
	CardIds.ScourgeTamer,
	CardIds.ScourgingTavernBrawl,
	CardIds.Scrapsmith,
	CardIds.Seance,
	CardIds.SecondWishTavernBrawl,
	CardIds.SecureTheDeck,
	CardIds.SeekGuidance_IlluminateTheVoidToken, // Xyrella, the Sanctified
	CardIds.SelectiveBreederCore,
	CardIds.SendInTheScout_Si7ScoutTavernBrawl,
	CardIds.SerpentWig_TSC_215,
	CardIds.ServiceBell,
	CardIds.SethekkVeilweaver,
	CardIds.ShadowCouncil_BT_306,
	CardIds.ShadowVisions,
	CardIds.ShiftingShade,
	CardIds.Shimmerfly,
	CardIds.Simulacrum_CORE_ICC_823,
	CardIds.Simulacrum_ICC_823,
	CardIds.Sindragosa_FrozenChampionToken,
	CardIds.SinfulSousChef,
	CardIds.SinisterDeal,
	CardIds.SirakessCultist,
	CardIds.SisterSvalna_VisionOfDarknessToken,
	CardIds.SisterSvalna,
	CardIds.SketchyStranger,
	CardIds.SkyRaider,
	CardIds.Sleetbreaker,
	CardIds.SludgeSlurper,
	CardIds.SmugSenior,
	CardIds.SnackRun,
	CardIds.SneakyDelinquent,
	CardIds.SoothsayersCaravan,
	CardIds.SorcerersGambit_ReachThePortalRoomToken, // Arcanist Dawngrasp
	CardIds.SorcerersGambit,
	CardIds.SouleatersScythe_BoundSoulToken,
	CardIds.SparkDrill_BOT_102,
	CardIds.Spellcoiler,
	CardIds.Spellslinger_AT_007,
	CardIds.Spellslinger_WON_344,
	CardIds.Springpaw_CORE_TRL_348,
	CardIds.Springpaw_TRL_348,
	CardIds.StaffOfAmmunae_ULDA_041,
	CardIds.StarlightWhelp,
	CardIds.Starseeker_ULDA_Elise_HP3,
	CardIds.StarseekersTools,
	CardIds.StarseekersToolsTavernBrawl,
	CardIds.StewardOfScrolls_SCH_245,
	CardIds.StitchedTracker_CORE_ICC_415,
	CardIds.StitchedTracker_ICC_415,
	CardIds.StudentOfTheStars,
	CardIds.SubmergedSpacerock,
	CardIds.SummerFlowerchild,
	CardIds.SunkenSweeper,
	CardIds.SuspiciousAlchemist_AMysteryEnchantment, // The one that really counts
	CardIds.SuspiciousAlchemist,
	CardIds.SuspiciousPeddler,
	CardIds.SuspiciousPirate,
	CardIds.SuspiciousUsher,
	CardIds.SwampDragonEgg,
	CardIds.Swashburglar,
	CardIds.SwashburglarCore,
	CardIds.Synthesize,
	CardIds.TamsinRoame_BAR_918,
	CardIds.TanglefurMystic,
	CardIds.TasteOfChaos,
	CardIds.TearReality,
	CardIds.TheCandlesquestion_TheCandlesquestion_DALA_714a,
	CardIds.TheCandlesquestion_TheCandlesquestion_DALA_714b,
	CardIds.TheCandlesquestion,
	CardIds.TheCavernsBelow,
	CardIds.TheCountess_LegendaryInvitationToken,
	CardIds.TheCountess,
	CardIds.TheDemonSeed_CompleteTheRitualToken,
	CardIds.TheForestsAid_DAL_256,
	CardIds.TheHandOfRafaam,
	CardIds.TheHarvesterOfEnvy,
	CardIds.TheLastKaleidosaur,
	CardIds.TheLichKing_ICC_314,
	CardIds.TheLobotomizer,
	CardIds.TheMarshQueen_QueenCarnassaToken,
	CardIds.TheMarshQueen,
	CardIds.ThePrimus,
	CardIds.TheSunwell,
	CardIds.ThistleTea,
	CardIds.ThoughtstealLegacy,
	CardIds.ThoughtstealVanilla,
	CardIds.TidestoneOfGolganneth,
	CardIds.TimelineAccelerator_WON_139,
	CardIds.TimeLostProtodrake,
	CardIds.TinyThimbleTavernBrawl,
	CardIds.TombPillager_CORE_LOE_012,
	CardIds.TombPillager_LOE_012,
	CardIds.TombPillager_WON_340,
	CardIds.TomeOfIntellectLegacy,
	CardIds.ToothOfNefarian,
	CardIds.Toshley,
	CardIds.TrainingSession_NX2_029,
	CardIds.TransferStudent_TransferStudentToken_SCH_199t19,
	CardIds.TwinSlice_BT_175,
	CardIds.TwistTheCoffers_CacheOfCashToken,
	CardIds.UldumTreasureCache,
	CardIds.UldumTreasureCacheTavernBrawl,
	CardIds.UmbralGeist,
	CardIds.UmbralSkulker,
	CardIds.UnderbellyAngler,
	CardIds.UndercityHuckster_OG_330,
	CardIds.UndercityHuckster_WON_317,
	CardIds.UnholyEmbraceTavernBrawl,
	CardIds.UniteTheMurlocs_MegafinToken,
	CardIds.UniteTheMurlocs,
	CardIds.UnleashTheBeast_DAL_378,
	CardIds.UnstablePortal_GVG_003,
	CardIds.VanessaVancleef_CORE_CS3_005,
	CardIds.VanessaVancleefLegacy,
	CardIds.VastWisdom,
	CardIds.VenomousScorpid,
	CardIds.VileApothecary,
	CardIds.VileConcoctionTavernBrawl,
	CardIds.VioletHaze,
	CardIds.VioletSpellwing,
	CardIds.VulperaScoundrel,
	CardIds.VulperaScoundrelCore,
	CardIds.Wandmaker,
	CardIds.WandThief_SCH_350,
	CardIds.Wanted,
	CardIds.WarCache,
	CardIds.WarCacheLegacy,
	CardIds.WatcherOfTheSun_WatcherOfTheSunToken,
	CardIds.WatcherOfTheSun,
	CardIds.WeaponizedPiñata,
	CardIds.Webspinner_CORE_FP1_011,
	CardIds.Webspinner_FP1_011,
	CardIds.WhispersOfEvil,
	CardIds.WildGrowthCore,
	CardIds.WildGrowthLegacy,
	CardIds.WildGrowthVanilla,
	CardIds.WitchsApprentice,
	CardIds.WitchwoodApple,
	CardIds.WitchwoodAppleCore,
	CardIds.WorgenRoadie_InstrumentCaseToken,
	CardIds.WorthyExpedition,
	CardIds.WretchedExile,
	CardIds.XarilPoisonedMind,
	CardIds.YoggSaronMasterOfFate_HandOfFateToken,
	CardIds.YseraLegacy,
	CardIds.YseraTheDreamerCore,
	CardIds.YseraVanilla,
	CardIds.Zaqul_Story_11_Zaqul,
	CardIds.Zaqul_TSC_959,
	CardIds.ZephrysTheGreat_ULD_003,
	CardIds.ZolaTheGorgon,
	CardIds.ZolaTheGorgonCore,
];