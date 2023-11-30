import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewRef } from '@angular/core';
import { AbstractSubscriptionComponent } from '@firestone/shared/framework/common';
import { Observable, combineLatest, shareReplay } from 'rxjs';
import { AdService } from '../../services/premium/ad.service';
import { OwLegacyPremiumService } from '../../services/premium/ow-legacy-premium.service';
import { SubscriptionService } from '../../services/premium/subscription.service';
import { TebexService } from '../../services/premium/tebex.service';

@Component({
	selector: 'premium-desktop',
	styleUrls: [`./premium-desktop.component.scss`],
	template: `
		<div class="premium">
			<div class="header">
				<div class="title" [fsTranslate]="'app.premium.title'"></div>
			</div>
			<div class="plans" [ngClass]="{ 'show-legacy': showLegacyPlan$ | async }">
				<premium-package
					class="plan"
					*ngFor="let plan of plans$ | async"
					[plan]="plan"
					(subscribe)="onSubscribe($event)"
					(unsubscribe)="onUnsubscribe($event)"
				></premium-package>
			</div>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PremiumDesktopComponent extends AbstractSubscriptionComponent implements AfterViewInit {
	plans$: Observable<readonly PremiumPlan[]>;
	showLegacyPlan$: Observable<boolean>;

	constructor(
		protected readonly cdr: ChangeDetectorRef,
		private readonly subscriptionService: SubscriptionService,
		private readonly tebex: TebexService,
		private readonly owLegacyPremium: OwLegacyPremiumService,
		private readonly ads: AdService,
	) {
		super(cdr);
	}

	async ngAfterViewInit() {
		await this.tebex.isReady();
		await this.owLegacyPremium.isReady();
		await this.ads.isReady();
		await this.subscriptionService.isReady();

		this.plans$ = combineLatest([this.tebex.packages$$, this.ads.currentPlan$$]).pipe(
			shareReplay(1),
			this.mapData(([packages, currentPlanSub]) => {
				console.debug('building plans');
				return ALL_PLANS.filter((plan) => currentPlanSub === 'legacy' || plan.id !== 'legacy').map((plan) => {
					const packageForPlan = packages?.find((p) => p.name.toLowerCase() === plan.id);
					return {
						...plan,
						price: packageForPlan?.total_price ?? plan.price,
						activePlan: currentPlanSub,
					} as PremiumPlan;
				});
			}),
		);
		this.showLegacyPlan$ = this.plans$.pipe(this.mapData((plans) => plans.some((plan) => plan.id === 'legacy')));

		if (!(this.cdr as ViewRef)?.destroyed) {
			this.cdr.detectChanges();
		}
	}

	async onUnsubscribe(planId: string) {
		console.log('unsubscribing from plan', planId);
		const result = await this.subscriptionService.unsubscribe(planId);
		console.log('unsubscribed from plan result', planId, result);
	}

	onSubscribe(planId: string) {
		console.log('subscribing to plan', planId);
	}
}

const ALL_PLANS: readonly Partial<PremiumPlan>[] = [
	{
		id: 'legacy',
		features: {
			supportFirestone: true,
			removeAds: true,
			premiumFeatures: true,
		},
		isReadonly: true,
		price: 4.99,
		text: `app.premium.legacy-plan-text`,
	},
	{
		id: 'friend',
		features: {
			supportFirestone: true,
			discordRole: 'friend',
		},
	},
	{
		id: 'premium+',
		features: {
			supportFirestone: true,
			discordRole: 'premium+',
			removeAds: true,
			premiumFeatures: true,
			prioritySupport: true,
		},
	},
	{
		id: 'premium',
		features: {
			supportFirestone: true,
			discordRole: 'premium',
			removeAds: true,
			premiumFeatures: true,
		},
	},
];

export interface PremiumPlan {
	readonly id: string;
	readonly price: number;
	readonly features: {
		readonly supportFirestone?: boolean;
		readonly discordRole?: string;
		readonly removeAds?: boolean;
		readonly premiumFeatures?: boolean;
		readonly prioritySupport?: boolean;
	};
	readonly isReadonly?: boolean;
	readonly activePlan?: string;
	readonly text?: string;
}
