import { Injectable } from '@angular/core';
import { DuelsRewardsInfo } from '@firestone-hs/save-dungeon-loot-info/dist/input';
import { ArenaInfo } from '../../../models/arena-info';
import { RewardsTrackInfo } from '../../../models/rewards-track-info';

declare let OverwolfPlugin: any;

@Injectable()
export class MindVisionService {
	private mindVisionPlugin: any;

	initialized = false;

	constructor() {
		this.initialize();
	}

	public async getCollection(): Promise<any[]> {
		return new Promise<any[]>(async (resolve, reject) => {
			const plugin = await this.get();
			try {
				plugin.getCollection(collection => {
					resolve(collection ? JSON.parse(collection) : null);
				});
			} catch (e) {
				console.log('[mind-vision] could not parse collection', e);
				resolve(null);
			}
		});
	}

	public async getMatchInfo(): Promise<any> {
		return new Promise<any[]>(async resolve => {
			const plugin = await this.get();
			try {
				plugin.getMatchInfo(matchInfo => {
					resolve(matchInfo ? JSON.parse(matchInfo) : null);
				});
			} catch (e) {
				console.log('[mind-vision] could not parse matchInfo', e);
				resolve(null);
			}
		});
	}

	public async getDuelsInfo(forceReset = false): Promise<any> {
		return new Promise<any[]>(async resolve => {
			const plugin = await this.get();
			try {
				plugin.getDuelsInfo(forceReset, info => {
					// console.log('[mind-vision] retrieved duels info', info);
					resolve(info ? JSON.parse(info) : null);
				});
			} catch (e) {
				console.log('[mind-vision] could not parse duelsInfo', e);
				resolve(null);
			}
		});
	}

	public async getBattlegroundsInfo(forceReset = false): Promise<{ Rating: number }> {
		return new Promise<{ Rating: number }>(async resolve => {
			if (forceReset) {
				// console.log('forcing reset of mindvision', forceReset);
			}
			const plugin = await this.get();
			try {
				plugin.getBattlegroundsInfo(forceReset, battlegroundsInfo => {
					// console.log('[mind-vision] retrieved getBattlegroundsInfo', battlegroundsInfo);
					resolve(battlegroundsInfo ? JSON.parse(battlegroundsInfo) : null);
				});
			} catch (e) {
				console.log('[mind-vision] could not parse battlegroundsInfo', e);
				resolve(null);
			}
		});
	}

	public async getArenaInfo(): Promise<ArenaInfo> {
		return new Promise<ArenaInfo>(async resolve => {
			const plugin = await this.get();
			try {
				plugin.getArenaInfo(arenaInfo => {
					resolve(arenaInfo ? JSON.parse(arenaInfo) : null);
				});
			} catch (e) {
				console.log('[mind-vision] could not parse getArenaInfo', e);
				resolve(null);
			}
		});
	}

	public async getActiveDeck(): Promise<any> {
		return new Promise<any[]>(async resolve => {
			const plugin = await this.get();
			try {
				plugin.getActiveDeck(activeDeck => {
					resolve(activeDeck ? JSON.parse(activeDeck) : null);
				});
			} catch (e) {
				console.log('[mind-vision] could not parse activeDeck', e);
				resolve(null);
			}
		});
	}

	public async getRewardsTrackInfo(): Promise<RewardsTrackInfo> {
		return new Promise<RewardsTrackInfo>(async resolve => {
			const plugin = await this.get();
			try {
				plugin.getRewardsTrackInfo(info => {
					resolve(info ? JSON.parse(info) : null);
				});
			} catch (e) {
				console.log('[mind-vision] could not parse rewards track info', e);
				resolve(null);
			}
		});
	}

	public async getDuelsRewardsInfo(forceReset = false): Promise<DuelsRewardsInfo> {
		return new Promise<DuelsRewardsInfo>(async resolve => {
			const plugin = await this.get();
			try {
				plugin.getDuelsRewardsInfo(forceReset, info => {
					resolve(info ? JSON.parse(info) : null);
				});
			} catch (e) {
				console.log('[mind-vision] could not parse rewards track info', e);
				resolve(null);
			}
		});
	}

	public async getCurrentScene(): Promise<number> {
		return new Promise<number>(async resolve => {
			const plugin = await this.get();
			try {
				plugin.getCurrentScene(scene => {
					resolve(scene);
				});
			} catch (e) {
				console.log('[mind-vision] could not parse activeDeck', e);
				resolve(null);
			}
		});
	}

	public async reset(): Promise<void> {
		return new Promise<void>(async resolve => {
			const plugin = await this.get();
			try {
				plugin.reset(result => {
					resolve(result);
				});
			} catch (e) {
				console.log('[mind-vision] could not reset', e);
				resolve(null);
			}
		});
	}

	public async get() {
		await this.waitForInit();
		return this.mindVisionPlugin.get();
	}

	private initialize() {
		this.initialized = false;
		try {
			console.log('[mind-vision] plugin init starting', this.mindVisionPlugin);
			this.mindVisionPlugin = new OverwolfPlugin('mind-vision', true);
			this.mindVisionPlugin.initialize(async (status: boolean) => {
				if (status === false) {
					console.error("[mind-vision] Plugin couldn't be loaded??", 'retrying');
					setTimeout(() => this.initialize(), 2000);
					return;
				}
				console.log('[mind-vision] Plugin ' + this.mindVisionPlugin.get()._PluginName_ + ' was loaded!');
				this.mindVisionPlugin.get().onGlobalEvent.addListener((first: string, second: string) => {
					console.log('[mind-vision] received global event', first, second);
				});
				this.initialized = true;
			});
		} catch (e) {
			console.warn('[mind-vision]Could not load plugin, retrying', e);
			setTimeout(() => this.initialize(), 2000);
		}
	}

	private waitForInit(): Promise<void> {
		return new Promise<void>(resolve => {
			const dbWait = () => {
				if (this.initialized) {
					resolve();
				} else {
					setTimeout(() => dbWait(), 50);
				}
			};
			dbWait();
		});
	}
}
