import { Injectable } from '@angular/core';
import { AbstractFacadeService, AppInjector, WindowManagerService } from '@firestone/shared/framework/core';
import { OwLegacyPremiumService } from './ow-legacy-premium.service';
import { TebexService } from './tebex.service';

@Injectable()
export class SubscriptionService extends AbstractFacadeService<SubscriptionService> {
	private initialized = false;

	private legacy: OwLegacyPremiumService;
	private tebex: TebexService;

	constructor(protected override readonly windowManager: WindowManagerService) {
		super(windowManager, 'premiumSubscription', () => this.initialized);
	}

	protected override assignSubjects() {
		this.initialized = true;
		// this.packages$$ = this.mainInstance.packages$$;
	}

	protected async init() {
		this.legacy = AppInjector.get(OwLegacyPremiumService);
		this.tebex = AppInjector.get(TebexService);
	}

	// public async getSubscriptionStatus() {
	// 	return this.mainInstance.getSubscriptionStatusInternal();
	// }

	public async unsubscribe(planId: string) {
		return this.mainInstance.unsubscribeInternal(planId);
	}

	private async unsubscribeInternal(planId: string) {
		if (planId === 'legacy') {
			return this.legacy.unsubscribe();
		}
		// return this.tebex.unsubscribe(planId);
	}
}
