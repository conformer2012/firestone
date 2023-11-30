import { Injectable } from '@angular/core';
import { SubscriberAwareBehaviorSubject } from '@firestone/shared/framework/common';
import { AbstractFacadeService, AppInjector, WindowManagerService } from '@firestone/shared/framework/core';
import { OwLegacyPremiumService } from './ow-legacy-premium.service';
import { TebexService } from './tebex.service';

@Injectable()
export class SubscriptionService extends AbstractFacadeService<SubscriptionService> {
	public currentPlan$$: SubscriberAwareBehaviorSubject<CurrentPlan>;

	private legacy: OwLegacyPremiumService;
	private tebex: TebexService;

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

		this.currentPlan$$.onFirstSubscribe(async () => {
			const currentPlan = await this.getCurrentPlanInternal();
			// Once it is initialized, it should not be null, otherwise the getValueWithInit() will hang indefinitely
			this.currentPlan$$.next(currentPlan ?? null);
		});
	}

	public async unsubscribe(planId: string) {
		return this.mainInstance.unsubscribeInternal(planId);
	}

	private async unsubscribeInternal(planId: string) {
		if (planId === 'legacy') {
			await this.legacy.unsubscribe();
			this.currentPlan$$.next(null);
		}
		// return this.tebex.unsubscribe(planId);
	}

	private async getCurrentPlanInternal(): Promise<CurrentPlan> {
		const legacyPlan = await this.legacy.getSubscriptionStatus();
		if (legacyPlan != null) {
			console.log('legacy plan', legacyPlan);
			return {
				id: 'legacy',
				expireAt: legacyPlan.expireAt,
			};
		}
		// const tebexStatus = await this.tebex.getSubscriptionStatus();
		// if (tebexStatus?.status === 'active') {
		// 	return tebexStatus.package?.name;
		// }
		return null;
	}
}

export interface CurrentPlan {
	readonly id: string;
	readonly expireAt: Date;
}

export interface OwSub {
	readonly id: number;
	readonly username: string;
	readonly expireAt: Date;
	readonly state: number;
}
