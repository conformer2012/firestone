import { Injectable } from '@angular/core';
import { SubscriberAwareBehaviorSubject, sleep } from '@firestone/shared/framework/common';
import {
	AbstractFacadeService,
	ApiRunner,
	AppInjector,
	OverwolfService,
	WindowManagerService,
} from '@firestone/shared/framework/core';
import { combineLatest, debounceTime, distinctUntilChanged, filter } from 'rxjs';
import { AdService } from './ad.service';
import { deepEqual } from './utils';

const USER_MAPPING_UPDATE_URL = 'https://gpiulkkg75uipxcgcbfr4ixkju0ntere.lambda-url.us-west-2.on.aws/';

// TODO: use Hearthstone user id
@Injectable()
export class UserService extends AbstractFacadeService<UserService> {
	public user$$: SubscriberAwareBehaviorSubject<overwolf.profile.GetCurrentUserResult>;

	private ow: OverwolfService;
	private api: ApiRunner;
	private ads: AdService;

	constructor(protected override readonly windowManager: WindowManagerService) {
		super(windowManager, 'userService', () => !!this.user$$);
	}

	protected override assignSubjects() {
		this.user$$ = this.mainInstance.user$$;
	}

	protected async init() {
		this.user$$ = new SubscriberAwareBehaviorSubject<overwolf.profile.GetCurrentUserResult | null>(null);
		this.api = AppInjector.get(ApiRunner);
		this.ow = AppInjector.get(OverwolfService);
		this.ads = AppInjector.get(AdService);

		combineLatest([this.ads.enablePremiumFeatures$$, this.user$$])
			.pipe(
				debounceTime(500),
				filter(([premium, user]) => !!user),
				distinctUntilChanged((a, b) => deepEqual(a, b)),
			)
			.subscribe(([premium, user]) => {
				console.log('[user-service] info', premium, user);
				this.sendCurrentUser(user, premium);
			});

		const user = await this.retrieveUserInfo();
		this.user$$.next(user);

		this.ow.addLoginStateChangedListener(async () => {
			const user = await this.retrieveUserInfo();
			this.user$$.next(user);
		});
	}

	public async getCurrentUser(): Promise<overwolf.profile.GetCurrentUserResult> {
		return await this.user$$.getValueWithInit();
	}

	private async retrieveUserInfo() {
		let retries = 10;
		let user = await this.ow.getCurrentUser();
		// console.log('[user-service] retrieved user info', user);
		while (user?.username && !user.avatar && retries > 0) {
			// console.log('[user-service] no avatar yet', user);
			user = await this.ow.getCurrentUser();
			retries--;
			await sleep(500);
		}
		return user;
	}

	private async sendCurrentUser(user: overwolf.profile.GetCurrentUserResult, isPremium: boolean) {
		// Don't send anything in dev to allow for impersonation
		if (process.env.NODE_ENV !== 'production') {
			console.warn('[user-service] not sending user mapping in dev');
			return;
		}

		// console.log('[user-service] sending current user', user, isPremium);
		if (!!user.username) {
			await this.api.callPostApi(USER_MAPPING_UPDATE_URL, {
				userId: user.userId,
				userName: user.username,
				isPremium: isPremium,
			});
		}
	}
}
