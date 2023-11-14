import { Injectable } from '@angular/core';
import { OverwolfService, WindowManagerService } from '@firestone/shared/framework/core';
import { sleep } from '@services/utils';
import { BehaviorSubject } from 'rxjs';
import { filter, tap } from 'rxjs/operators';
import { PreferencesService } from './preferences.service';

@Injectable()
export class OwNotificationsService {
	private windowId: string;
	private messageId = 0;
	// Because if we start the app during a game, it might take some time for the notif window to
	// be created
	private retriesLeft = 30;
	private isDev: boolean;
	private isBeta: boolean;

	private stateEmitter = new BehaviorSubject<Message>(undefined);

	constructor(
		private readonly ow: OverwolfService,
		private readonly prefs: PreferencesService,
		private readonly windowManager: WindowManagerService,
	) {
		// Give it time to boot
		this.startNotificationsWindow();
		this.windowManager.registerGlobalService(
			'notificationsEmitterBus',
			this.stateEmitter.pipe(
				filter((message) => !!message),
				tap((message) => console.debug('[notifications] emitting new message', message)),
			),
		);

		this.init();
	}

	private async init() {
		this.isDev = process.env.NODE_ENV !== 'production';
		const settings = await this.ow.getExtensionSettings();
		this.isBeta = settings?.settings?.channel === 'beta';
	}

	public async addNotification(htmlMessage: Message) {
		if (!(await this.prefs.getPreferences()).setAllNotifications) {
			console.log('not showing any notification');
			return;
		}
		this.stateEmitter.next(htmlMessage);
	}

	// This directly share JS objects, without stringifying them, so it lets us do some
	// fancy stuff
	public async emitNewNotification(htmlMessage: Message, bypassPrefs = false) {
		if (!bypassPrefs && !(await this.prefs.getPreferences()).setAllNotifications) {
			console.log('not showing any notification');
			return;
		}
		if (!this.windowId) {
			if (this.retriesLeft <= 0) {
				throw new Error('NotificationsWindow was not identified at app start');
			} else {
				this.retriesLeft--;
				setTimeout(() => {
					this.emitNewNotification(htmlMessage);
				}, 500);
				return;
			}
		}
		console.debug('emitting new notification', htmlMessage);
		this.stateEmitter.next(htmlMessage);
	}

	public notifyDebug(title: string, text: string, code: string) {
		if (!this.isDev && !this.isBeta) {
			return;
		}

		this.emitNewNotification({
			content: `
				<div class="general-message-container general-theme">
					<div class="firestone-icon">
						<svg class="svg-icon-fill">
							<use xlink:href="assets/svg/sprite.svg#ad_placeholder" />
						</svg>
					</div>
					<div class="message">
						<div class="title">
							<span>${title}</span>
						</div>
						<span class="text">${text}</span>
					</div>
					<button class="i-30 close-button">
						<svg class="svg-icon-fill">
							<use xmlns:xlink="https://www.w3.org/1999/xlink" xlink:href="assets/svg/sprite.svg#window-control_close"></use>
						</svg>
					</button>
				</div>`,
			notificationId: `${code}`,
		});
	}

	public notifyInfo(title: string, text: string, code: string) {
		this.emitNewNotification({
			content: `
				<div class="general-message-container general-theme">
					<div class="firestone-icon">
						<svg class="svg-icon-fill">
							<use xlink:href="assets/svg/sprite.svg#ad_placeholder" />
						</svg>
					</div>
					<div class="message">
						<div class="title">
							<span>${title}</span>
						</div>
						<span class="text">${text}</span>
					</div>
					<button class="i-30 close-button">
						<svg class="svg-icon-fill">
							<use xmlns:xlink="https://www.w3.org/1999/xlink" xlink:href="assets/svg/sprite.svg#window-control_close"></use>
						</svg>
					</button>
				</div>`,
			notificationId: `${code}`,
		});
	}

	public notifyError(title: string, text: string, code: string) {
		this.emitNewNotification(
			{
				content: `
				<div class="general-message-container general-theme">
					<div class="firestone-icon">
						<svg class="svg-icon-fill">
							<use xlink:href="assets/svg/sprite.svg#ad_placeholder" />
						</svg>
					</div>
					<div class="message">
						<div class="title">
							<span>${title}</span>
						</div>
						<span class="text">${text}</span>
					</div>
					<button class="i-30 close-button">
						<svg class="svg-icon-fill">
							<use xmlns:xlink="https://www.w3.org/1999/xlink" xlink:href="assets/svg/sprite.svg#window-control_close"></use>
						</svg>
					</button>
				</div>`,
				timeout: 60000,
				notificationId: `${code}`,
			},
			true,
		);
	}

	private async startNotificationsWindow() {
		while (!this.windowId) {
			console.log('[notifs] waiting for notifications window to be created');
			this.detectNotificationsWindow();
			await sleep(2000);
		}
	}

	private async detectNotificationsWindow() {
		const window = await this.ow.obtainDeclaredWindow(OverwolfService.NOTIFICATIONS_WINDOW);
		const windowId = window.id;
		// await this.ow.restoreWindow(windowId);
		await this.ow.hideWindow(windowId);
		this.windowId = windowId;
	}
}

export interface Message {
	notificationId: string;
	content: string;
	cardId?: string;
	type?: string;
	app?: 'achievement' | 'collection' | 'decktracker' | 'replays';
	timeout?: number;
	theClass?: string;
	clickToClose?: boolean;
	eventToSendOnClick?: () => void;
	handlers?: readonly {
		selector: string;
		action: () => void | Promise<void>;
	}[];
}
