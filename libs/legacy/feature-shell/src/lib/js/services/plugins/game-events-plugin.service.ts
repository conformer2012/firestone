import { Injectable } from '@angular/core';

declare let OverwolfPlugin: any;

@Injectable()
export class GameEventsPluginService {
	private gameEventsPlugin: any;

	private initialized = false;
	private initializing = false;

	constructor() {
		try {
			new OverwolfPlugin('overwolf-replay-converter', true);
		} catch (e) {
			console.warn('[ow-utils] ERROR: OverwolfPlugin is not defined');
			return;
		}
		this.gameEventsPlugin = new OverwolfPlugin('overwolf-replay-converter', true);
	}

	async initialize() {
		if (this.initialized || this.initializing) {
			return;
		}

		this.initializing = true;
		try {
			this.gameEventsPlugin.initialize((status: boolean) => {
				if (status === false) {
					console.error("[game-events] Plugin couldn't be loaded??", 'retrying');
					setTimeout(() => this.initialize(), 2000);
					return;
				}
				console.log('[game-events] Plugin ' + this.gameEventsPlugin.get()._PluginName_ + ' was loaded!');
				this.initialized = true;
				this.initializing = false;
			});
			const plugin = await this.get();
			plugin.onGlobalEvent.addListener((first: string, second: string) => {
				if (first && first.includes('ERROR TO LOG')) {
					console.error('[game-events] received global event', first, second);
				}
			});
		} catch (e) {
			console.warn('Could not load plugin, retrying', e);
			setTimeout(() => this.initialize(), 2000);
		}
	}

	public async get() {
		await this.initialize();
		await this.waitForInit();
		return this.gameEventsPlugin.get();
	}

	private waitForInit(): Promise<void> {
		return new Promise<void>((resolve) => {
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
