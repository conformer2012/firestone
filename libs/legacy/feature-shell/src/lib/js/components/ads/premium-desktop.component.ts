import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewRef } from '@angular/core';
import { AbstractSubscriptionComponent } from '@firestone/shared/framework/common';
import { Observable, combineLatest, shareReplay } from 'rxjs';
import { AdService } from '../../services/premium/ad.service';
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
				<premium-package class="plan" *ngFor="let plan of plans$ | async" [plan]="plan"></premium-package>
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
		private readonly tebex: TebexService,
		private readonly ads: AdService,
	) {
		super(cdr);
	}

	async ngAfterViewInit() {
		await this.tebex.isReady();
		await this.ads.isReady();

		this.plans$ = combineLatest([this.tebex.packages$$, this.ads.hasLegacySub$$]).pipe(
			shareReplay(1),
			this.mapData(([packages, hasLegacySub]) => {
				console.debug('building plans');
				return ALL_PLANS.filter((plan) => hasLegacySub || plan.id !== 'legacy').map((plan) => {
					const packageForPlan = packages?.find((p) => p.name.toLowerCase() === plan.id);
					return {
						...plan,
						price: packageForPlan?.total_price ?? plan.price,
						isActive: plan.id === 'legacy' && hasLegacySub,
					} as PremiumPlan;
				});
			}),
		);
		this.showLegacyPlan$ = this.plans$.pipe(this.mapData((plans) => plans.some((plan) => plan.id === 'legacy')));

		if (!(this.cdr as ViewRef)?.destroyed) {
			this.cdr.detectChanges();
		}
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
	readonly isActive?: boolean;
}
