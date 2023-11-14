import { Injectable } from '@angular/core';
import { WindowManagerService } from '@firestone/shared/framework/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { concatMap, distinctUntilChanged, filter } from 'rxjs/operators';
import { MemoryUpdate } from '../../models/memory/memory-update';
import { BroadcastEvent, Events } from '../events.service';
import { GameNativeState } from './game-native-state';

@Injectable()
export class GameNativeStateStoreService {
	public store$ = new BehaviorSubject<GameNativeState>(GameNativeState.create({}));

	private events$: Observable<BroadcastEvent>;

	constructor(private readonly events: Events, windowManager: WindowManagerService) {
		windowManager.registerGlobalService('gameNativeStateStore', this.store$);
		this.init();
	}

	private async processEvent(event: BroadcastEvent): Promise<void> {
		try {
			const changes = event.data[0] as MemoryUpdate;
			if (changes.isFriendsListOpen != null) {
				this.store$.next(
					this.store$.value.update({
						isFriendsListOpen: changes.isFriendsListOpen,
					}),
				);
			} else if (changes.IsDuelsChoosingHero != null) {
				this.store$.next(
					this.store$.value.update({
						isDuelsChoosingHero: changes.IsDuelsChoosingHero,
					}),
				);
			}
		} catch (e) {
			console.error('[game-native-state] could not process event', event.key, event, e);
		}
	}

	private async init() {
		this.events$ = this.events.on(Events.MEMORY_UPDATE);

		combineLatest(this.events$)
			.pipe(
				distinctUntilChanged(),
				filter(([event]) => !!event),
				concatMap(async ([event]) => await this.processEvent(event)),
			)
			.subscribe();
	}
}
