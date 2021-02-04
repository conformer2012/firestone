import { Injectable } from '@angular/core';
import { AllCardsService } from '@firestone-hs/replay-parser';
import { GameEvent } from '../../../../models/game-event';
import { FeatureFlags } from '../../../feature-flags';
import { GameEventsEmitterService } from '../../../game-events-emitter.service';
import { ProcessingQueue } from '../../../processing-queue.service';
import { RTStatsBgsFaceOffParser } from './event-parsers/battlegrounds/rtstats-bgs-face-offs-parser';
import { RTStatsGameStartParser } from './event-parsers/rtstats-game-start-parser';
import { RTStatsMetadataParser } from './event-parsers/rtstats-metadata-parser';
import { RTStatsTotalDamageDealtByHeroesParser } from './event-parsers/rtstats-total-damage-dealt-by-heroes-parser';
import { RTStatsTotalDamageDealtByMinionsParser } from './event-parsers/rtstats-total-damage-dealt-by-minions-parser';
import { RTStatsTotalDamageTakenByHeroesParser } from './event-parsers/rtstats-total-damage-taken-by-heroes-parser';
import { RTStatsTotalDamageTakenByMinionsParser } from './event-parsers/rtstats-total-damage-taken-by-minions-parser';
import { EventParser } from './event-parsers/_event-parser';
import { RealTimeStatsState } from './real-time-stats';

// TODO: move this into a mode-independant package, as it could be used for non-bg stuff
@Injectable()
export class RealTimeStatsService {
	private state: RealTimeStatsState = new RealTimeStatsState();
	private processingQueue = new ProcessingQueue<GameEvent>(
		eventQueue => this.processQueue(eventQueue),
		50,
		'bgs-real-time-stats-queue',
	);
	private eventParsers: readonly EventParser[];

	constructor(private readonly gameEvents: GameEventsEmitterService, private readonly allCards: AllCardsService) {
		if (!FeatureFlags.ENABLE_REAL_TIME_STATS) {
			return;
		}
		this.init();
	}

	private async processQueue(eventQueue: readonly GameEvent[]) {
		try {
			const stateUpdateEvents = eventQueue.filter(event => event.type === GameEvent.GAME_STATE_UPDATE);
			const eventsToProcess = [
				...eventQueue.filter(event => event.type !== GameEvent.GAME_STATE_UPDATE),
				stateUpdateEvents.length > 0 ? stateUpdateEvents[stateUpdateEvents.length - 1] : null,
			].filter(event => event);
			// console.log('will processed', eventsToProcess.length, 'events');
			for (let i = 0; i < eventsToProcess.length; i++) {
				await this.processEvent(eventsToProcess[i]);
			}
		} catch (e) {
			console.error('Exception while processing event', e);
		}
		return [];
	}

	private async processEvent(gameEvent: GameEvent) {
		// this.debug('parsing', this.state);
		let newState = this.state;
		for (const parser of this.eventParsers) {
			try {
				if (parser.applies(gameEvent, newState ?? this.state)) {
					newState = await parser.parse(gameEvent, newState ?? this.state);
				}
			} catch (e) {
				console.error('[game-state] Exception while applying parser', parser.name(), e.message, e.stack, e);
			}
		}
		if (newState !== this.state) {
			this.state = newState;
			this.debug('state', this.state);
		}
	}

	private init() {
		this.eventParsers = this.buildEventParsers();
		this.gameEvents.allEvents.subscribe(async (gameEvent: GameEvent) => {
			this.processingQueue.enqueue(gameEvent);
		});
	}

	private buildEventParsers(): readonly EventParser[] {
		return [
			new RTStatsGameStartParser(),
			new RTStatsMetadataParser(),
			new RTStatsTotalDamageDealtByMinionsParser(this.allCards),
			new RTStatsTotalDamageTakenByMinionsParser(this.allCards),
			new RTStatsTotalDamageDealtByHeroesParser(this.allCards),
			new RTStatsTotalDamageTakenByHeroesParser(this.allCards),

			// BG-specific
			new RTStatsBgsFaceOffParser(),
		];
	}

	private debug(...args) {
		console.debug('[bgs-real-time-stats]', ...args);
	}
}
