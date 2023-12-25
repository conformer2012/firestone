import { Injectable } from '@angular/core';
import { SubscriberAwareBehaviorSubject } from '@firestone/shared/framework/common';
import {
	AbstractFacadeService,
	AppInjector,
	IAdsService,
	WindowManagerService,
} from '@firestone/shared/framework/core';
import { combineLatest } from 'rxjs';
import { AppUiStoreFacadeService } from '../ui-store/app-ui-store-facade.service';
import { SubscriptionService, premiumPlanIds } from './subscription.service';

@Injectable()
export class AdService extends AbstractFacadeService<AdService> implements IAdsService {
	public showAds$$: SubscriberAwareBehaviorSubject<boolean>;
	public enablePremiumFeatures$$: SubscriberAwareBehaviorSubject<boolean>;
	public hasPremiumSub$$: SubscriberAwareBehaviorSubject<boolean>;

	private store: AppUiStoreFacadeService;
	private subscriptions: SubscriptionService;

	constructor(protected override readonly windowManager: WindowManagerService) {
		super(windowManager, 'adsService', () => !!this.showAds$$);
	}

	protected override assignSubjects() {
		this.showAds$$ = this.mainInstance.showAds$$;
		this.enablePremiumFeatures$$ = this.mainInstance.enablePremiumFeatures$$;
		this.hasPremiumSub$$ = this.mainInstance.hasPremiumSub$$;
	}

	protected async init() {
		this.showAds$$ = new SubscriberAwareBehaviorSubject<boolean>(true);
		this.enablePremiumFeatures$$ = new SubscriberAwareBehaviorSubject<boolean>(false);
		this.hasPremiumSub$$ = new SubscriberAwareBehaviorSubject<boolean>(false);
		this.store = AppInjector.get(AppUiStoreFacadeService);
		this.subscriptions = AppInjector.get(SubscriptionService);

		await this.subscriptions.isReady();
		await this.store.initComplete();

		this.subscriptions.currentPlan$$.subscribe((plan) => {
			console.log('[ads] current plan', plan);
			const showAds = !premiumPlanIds.includes(plan?.id);
			const hasPremiumSub = premiumPlanIds.includes(plan?.id);
			this.showAds$$.next(showAds);
			this.hasPremiumSub$$.next(hasPremiumSub);
		});
		combineLatest([this.hasPremiumSub$$, this.store.shouldTrackLottery$()]).subscribe(
			([isPremium, shouldTrack]) => {
				console.debug('[ads] isPremium', isPremium, 'show ads?', shouldTrack);
				this.enablePremiumFeatures$$.next(isPremium || shouldTrack);
			},
		);
	}

	public async shouldDisplayAds(): Promise<boolean> {
		return this.mainInstance.shouldDisplayAdsInternal();
	}

	private async shouldDisplayAdsInternal(): Promise<boolean> {
		const plan = await this.subscriptions.currentPlan$$.getValueWithInit(undefined);
		if (premiumPlanIds.includes(plan?.id)) {
			return false;
		}
		return true;
	}
}
