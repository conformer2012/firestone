import { Injectable } from '@angular/core';
import { SubscriberAwareBehaviorSubject } from '@firestone/shared/framework/common';
import {
	AbstractFacadeService,
	AppInjector,
	LocalStorageService,
	WindowManagerService,
} from '@firestone/shared/framework/core';
import { OwLegacyPremiumService } from './ow-legacy-premium.service';
import { TebexService } from './tebex.service';

@Injectable()
export class SubscriptionService extends AbstractFacadeService<SubscriptionService> {
	public currentPlan$$: SubscriberAwareBehaviorSubject<CurrentPlan>;

	private legacy: OwLegacyPremiumService;
	private tebex: TebexService;
	private localStorage: LocalStorageService;

	constructor(protected override readonly windowManager: WindowManagerService) {
		super(windowManager, 'premiumSubscription', () => !!this.currentPlan$$);
	}

	protected override assignSubjects() {
		this.currentPlan$$ = this.mainInstance.currentPlan$$;
	}

	protected async init() {
		this.currentPlan$$ = new SubscriberAwareBehaviorSubject<CurrentPlan>(undefined);
		this.legacy = AppInjector.get(OwLegacyPremiumService);
		this.tebex = AppInjector.get(TebexService);
		this.localStorage = AppInjector.get(LocalStorageService);

		this.currentPlan$$.onFirstSubscribe(async () => {
			const localPlan = this.localStorage.getItem<CurrentPlan>(LocalStorageService.CURRENT_SUB_PLAN);
			if (localPlan) {
				this.currentPlan$$.next(localPlan);
			}

			await this.fetchCurrentPlan();
		});
	}

	public async subscribe(planId: string) {
		return this.mainInstance.subscribeInternal(planId);
	}

	public async unsubscribe(planId: string) {
		return this.mainInstance.unsubscribeInternal(planId);
	}

	public async fetchCurrentPlan(): Promise<CurrentPlan> {
		return this.mainInstance.fetchCurrentPlanInternal();
	}

	private async subscribeInternal(planId: string) {
		await this.tebex.subscribe(planId);
	}

	private async unsubscribeInternal(planId: string) {
		if (planId === 'legacy') {
			await this.legacy.unsubscribe();
			this.currentPlan$$.next(null);
		}
		// return this.tebex.unsubscribe(planId);
	}

	private async fetchCurrentPlanInternal(): Promise<CurrentPlan> {
		const currentPlan = await this.getCurrentPlanInternal();
		// Once it is initialized, it should not be null, otherwise the getValueWithInit() will hang indefinitely
		this.currentPlan$$.next(currentPlan ?? null);
		this.localStorage.setItem(LocalStorageService.CURRENT_SUB_PLAN, currentPlan);
		return currentPlan;
	}

	private async getCurrentPlanInternal(): Promise<CurrentPlan> {
		const tebexPlan = await this.tebex.getSubscriptionStatus();
		if (tebexPlan != null) {
			console.log('tebex plan', tebexPlan);
			return tebexPlan;
		}

		const legacyPlan = await this.legacy.getSubscriptionStatus();
		if (legacyPlan != null) {
			console.log('legacy plan', legacyPlan);
			return;
		}
		// const tebexStatus = await this.tebex.getSubscriptionStatus();
		// if (tebexStatus?.status === 'active') {
		// 	return tebexStatus.package?.name;
		// }
		return null;
	}
}

export interface CurrentPlan {
	readonly id: PremiumPlanId;
	readonly expireAt: Date;
	readonly active: boolean;
	readonly cancelled: boolean;
	readonly autoRenews: boolean;
}

export interface OwSub {
	readonly id: number;
	readonly username: string;
	readonly expireAt: Date;
	readonly state: number;
}

export type PremiumPlanId = 'legacy' | 'friend' | 'premium' | 'premium+';
