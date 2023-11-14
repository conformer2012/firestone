import { EventEmitter, Injectable } from '@angular/core';
import { Input as ArenaRewards } from '@firestone-hs/api-arena-rewards/dist/sqs-event';
import { GameType, SceneMode } from '@firestone-hs/reference-data';
import { ApiRunner, CardsFacadeService, WindowManagerService } from '@firestone/shared/framework/core';
import { GameStat } from '@firestone/stats/data-access';
import { filter, take } from 'rxjs';
import { ArenaInfo } from '../../models/arena-info';
import { GameEvent } from '../../models/game-event';
import { MemoryUpdate, Reward } from '../../models/memory/memory-update';
import { Events } from '../events.service';
import { GameEventsEmitterService } from '../game-events-emitter.service';
import { GameStatusService } from '../game-status.service';
import { SceneService } from '../game/scene.service';
import { ArenaRewardsUpdatedEvent } from '../mainwindow/store/events/arena/arena-rewards-updated-event';
import { MainWindowStoreEvent } from '../mainwindow/store/events/main-window-store-event';
import { ManastormInfo } from '../manastorm-bridge/manastorm-info';
import { MemoryInspectionService } from '../plugins/memory-inspection.service';
import { GameStatsLoaderService } from '../stats/game/game-stats-loader.service';
import { UserService } from '../user.service';
import { uuid } from '../utils';

const UPDATE_URL = 'https://5ko26odaiczaspuvispnw3iv3e0kthll.lambda-url.us-west-2.on.aws/';

@Injectable()
export class ArenaRunParserService {
	private readonly goingIntoQueueRegex = new RegExp('D \\d*:\\d*:\\d*.\\d* BeginEffect blur \\d => 1');

	public currentArenaRunId: string;
	public busyRetrievingInfo: boolean;

	private spectating: boolean;
	private lastArenaMatch: GameStat;
	private currentArenaWins: number;
	private currentArenaLosses: number;

	private currentReviewId: string;
	private currentGameType: GameType;
	private arenaInfo: ArenaInfo;
	private rewardsInput: ArenaRewards;

	private stateUpdater: EventEmitter<MainWindowStoreEvent>;

	constructor(
		private gameEvents: GameEventsEmitterService,
		private memory: MemoryInspectionService,
		private allCards: CardsFacadeService,
		private events: Events,
		private api: ApiRunner,
		private gamesStats: GameStatsLoaderService,
		private scene: SceneService,
		private gameStatus: GameStatusService,
		private readonly windowManager: WindowManagerService,
		private readonly userService: UserService,
	) {
		this.init();
	}

	private async init() {
		await this.gamesStats.isReady();
		await this.userService.isReady();

		this.gameStatus.inGame$$
			.pipe(
				filter((inGame) => inGame),
				take(1),
			)
			.subscribe(() => {
				this.gamesStats.gameStats$$.subscribe((newGameStats) => {
					this.setLastArenaMatch(newGameStats?.stats);
				});

				this.gameEvents.allEvents.subscribe((event: GameEvent) => {
					if (
						event.type === GameEvent.MATCH_METADATA &&
						!event.additionalData.spectating &&
						!this.spectating
					) {
						this.currentGameType = event.additionalData.metaData.GameType;
						this.debug(
							'retrieved match meta data',
							this.currentGameType,
							[GameType.GT_ARENA].includes(this.currentGameType),
						);
						if ([GameType.GT_ARENA].includes(this.currentGameType)) {
							this.handleArenaRunId();
						}
					} else if (event.type === GameEvent.SPECTATING) {
						this.spectating = event.additionalData.spectating;
					}
				});
				this.events.on(Events.REVIEW_INITIALIZED).subscribe(async (event) => {
					this.debug('Received new review id event', event);
					const info: ManastormInfo = event.data[0];
					if (info && info.type === 'new-empty-review') {
						this.currentReviewId = info.reviewId;
						this.debug('set reviewId');
						// this.sendLootInfo();
					}
				});

				this.events.on(Events.MEMORY_UPDATE).subscribe((event) => {
					this.debug('Received memory update', event);
					const changes: MemoryUpdate = event.data[0];
					if (changes.ArenaRewards?.length) {
						this.debug('Handling rewards');
						this.handleRewards(changes.ArenaRewards);
					}
				});

				setTimeout(async () => {
					this.stateUpdater = (await this.windowManager.getMainWindow()).mainWindowStoreUpdater;
				});
			});
	}

	private async handleRewards(rewards: readonly Reward[]) {
		if (this.rewardsInput?.runId === this.currentArenaRunId) {
			this.debug('already sent rewards for run', this.rewardsInput);
			return;
		}
		if (!this.arenaInfo) {
			this.arenaInfo = await this.memory.getArenaInfo();
		}

		if (!this.arenaInfo) {
			console.warn('could not retrieve arena info', this.currentReviewId, this.currentArenaRunId, rewards);
			return;
		}

		const user = await this.userService.getCurrentUser();
		this.rewardsInput = {
			userId: user.userId,
			userName: user.username,
			type: 'arena',
			reviewId: this.currentReviewId,
			runId: this.currentArenaRunId,
			rewards: rewards,
			currentWins: this.arenaInfo.wins,
			currentLosses: this.arenaInfo.losses,
			appVersion: process.env.APP_VERSION,
		};
		this.log('sending rewards info', this.rewardsInput);
		this.api.callPostApi(UPDATE_URL, this.rewardsInput);
		this.stateUpdater.next(new ArenaRewardsUpdatedEvent(this.rewardsInput));
	}

	private setLastArenaMatch(stats: readonly GameStat[]) {
		if (!stats?.length) {
			return;
		}

		const arenaGames = stats?.filter((stat) => stat.gameMode === 'arena');
		if (arenaGames?.[0]?.gameMode === 'arena') {
			this.debug(
				'setting last arena match, trying to see if it is the last match in run',
				stats[0].additionalResult,
				stats[0].result,
			);
			if (this.isMatchInRun(stats[0].additionalResult, stats[0].result)) {
				this.debug('setting last arena', stats[0]);
				this.lastArenaMatch = stats[0];
				this.currentArenaRunId = this.lastArenaMatch.runId;
				this.debug('set currentArenaRunId', this.currentArenaRunId);
			} else {
				this.debug('last match is not in run, resetting last arena run info');
				this.reset();
			}
		}
	}

	public async handleBlur(logLine: string) {
		if (this.spectating) {
			this.debug('spectating, not handling blur');
			return;
		}

		// this.logDebug('handling blur', logLine);
		if (!this.goingIntoQueueRegex.exec(logLine)) {
			return;
		}

		// this.logDebug('blurring');
		const currentScene = await this.scene.currentScene$$.getValueWithInit();
		// this.logDebug('got current scene', currentScene);
		if (currentScene !== SceneMode.DRAFT) {
			return;
		}

		if (!this.currentArenaRunId) {
			this.log('not enough info to link an Arena Reward');
			return;
		}

		// Don't do it before the rewards, otherwise it might bring a heavy toll on the CPU
		this.arenaInfo = this.arenaInfo || (await this.memory.getArenaInfo()) || ({} as any);
		this.updateCurrentArenaInfo(this.arenaInfo);
	}

	private async handleArenaRunId() {
		this.busyRetrievingInfo = true;
		this.arenaInfo = await this.memory.getArenaInfo();
		this.log('retrieved arena info', this.arenaInfo, this.currentGameType);

		if (!this.arenaInfo) {
			console.error('Could not retrieve arena info', this.currentArenaRunId);
			return;
		}

		if (this.isNewRun(this.arenaInfo)) {
			// Start a new run
			this.currentArenaRunId = uuid();
			this.reset();
			this.log('starting a new run', this.arenaInfo);
		}
		if (!this.currentArenaRunId) {
			this.currentArenaRunId = uuid();
			this.log('Could not retrieve arena run id, starting a new run', this.currentArenaRunId);
		}
		this.busyRetrievingInfo = false;
	}

	private isNewRun(arenaInfo: ArenaInfo): boolean {
		if (!arenaInfo) {
			return false;
		}
		if (arenaInfo?.wins === 0 && arenaInfo?.losses === 0) {
			if (
				// In case of ties for the first match, we don't want to start a new run
				this.lastArenaMatch?.result === 'tied' &&
				this.currentArenaWins === 0 &&
				this.currentArenaLosses === 0
			) {
				this.log('had a tie on the first round, not starting a new run');
			} else {
				this.log('wins and losses are 0, starting new run', arenaInfo);
				return true;
			}
		}

		if (
			(this.currentArenaWins != null && arenaInfo.wins < this.currentArenaWins) ||
			(this.currentArenaLosses != null && arenaInfo.losses < this.currentArenaLosses)
		) {
			this.log(
				'wins or losses less than previous info, starting new run',
				arenaInfo,
				this.currentArenaWins,
				this.currentArenaLosses,
			);
			return true;
		}

		if (this.lastArenaMatch?.additionalResult) {
			const [wins, losses] = this.lastArenaMatch.additionalResult.split('-').map((info) => parseInt(info));
			if (arenaInfo.wins < wins || arenaInfo.losses < losses) {
				this.log(
					'wins or losses less than previous info, starting new run',
					arenaInfo,
					this.lastArenaMatch.additionalResult,
					this.lastArenaMatch,
				);
				return true;
			}

			const heroCard = this.allCards.getCard(arenaInfo.heroCardId);
			const heroClass: string = heroCard?.playerClass?.toLowerCase();
			if (!this.lastArenaMatch.playerClass || heroClass !== this.lastArenaMatch.playerClass.toLowerCase()) {
				this.log(
					'different player class, starting new run',
					arenaInfo.heroCardId,
					heroClass,
					this.lastArenaMatch.playerCardId,
					this.lastArenaMatch.playerClass,
					arenaInfo,
					this.lastArenaMatch,
				);
				return true;
			}
		}
		return false;
	}

	private updateCurrentArenaInfo(arenaInfo: ArenaInfo) {
		this.currentArenaWins = arenaInfo.wins;
		this.currentArenaLosses = arenaInfo.losses;
		this.log('updated current arena info', this.currentArenaWins, this.currentArenaLosses);
	}

	private isMatchInRun(additionalResult: string, result: 'won' | 'lost' | 'tied'): boolean {
		if (!additionalResult) {
			this.log('isLastMatchInRun', 'no additional result', additionalResult, result);
			return false;
		}

		const [wins, losses] = additionalResult.split('-').map((info) => parseInt(info));
		this.log('isLastMatchInRun', 'wins, losses', wins, losses);
		if (wins === 11 && result === 'won') {
			this.log('last arena match was the last win of the run, not forwarding run id', additionalResult, result);
			return false;
		}
		if (losses === 2 && result === 'lost') {
			this.log('last arena match was the last loss of the run, not forwarding run id', additionalResult, result);
			return false;
		}
		return true;
	}

	private reset() {
		this.currentArenaWins = 0;
		this.currentArenaLosses = 0;
		this.lastArenaMatch = undefined;
	}

	private debug(...args) {
		// console.debug('[arena-run-parser]', this.currentReviewId, this.currentArenaRunId, ...args);
	}

	private log(...args) {
		console.log('[arena-run-parser]', this.currentReviewId, this.currentArenaRunId, ...args);
	}
}
