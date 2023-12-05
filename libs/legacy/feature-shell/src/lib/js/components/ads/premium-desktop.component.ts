import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewRef } from '@angular/core';
import { AbstractSubscriptionComponent, deepEqual } from '@firestone/shared/framework/common';
import { AnalyticsService } from '@firestone/shared/framework/core';
import { BehaviorSubject, Observable, combineLatest, distinctUntilChanged, shareReplay } from 'rxjs';
import { LocalizationFacadeService } from '../../services/localization-facade.service';
import { AdService } from '../../services/premium/ad.service';
import { OwLegacyPremiumService } from '../../services/premium/ow-legacy-premium.service';
import { CurrentPlan, PremiumPlanId, SubscriptionService } from '../../services/premium/subscription.service';
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
					(subscribe)="onSubscribeRequest($event)"
					(unsubscribe)="onUnsubscribeRequest($event)"
				></premium-package>
			</div>
		</div>
		<div class="modal-container confirmation-modal" *ngIf="showConfirmationPopUp$ | async as model">
			<div class="modal">
				<div class="background-container">
					<div class="title">{{ model.title }}</div>
					<div class="text">{{ model.text }}</div>
					<div class="buttons">
						<button
							class="button unsubscribe-button"
							*ngIf="!model.unsubscribing"
							[fsTranslate]="'app.premium.unsubscribe-button'"
							(click)="onUnsubscribe(model.planId)"
						></button>
						<button
							class="button unsubscribe-button processing"
							*ngIf="model.unsubscribing"
							[fsTranslate]="'app.premium.unsubscribe-modal.unsubscribe-ongoing-label'"
						></button>
						<button
							class="button cancel-button"
							[fsTranslate]="'app.premium.unsubscribe-modal.cancel-button'"
							(click)="onCancelUnsubscribe()"
						></button>
					</div>
				</div>
			</div>
		</div>
		<div class="modal-container pre-subscribe-modal" *ngIf="showPreSubscribeModal$ | async as model">
			<div class="modal">
				<div class="background-container">
					<div class="title">{{ model.title }}</div>
					<div class="text">{{ model.text }}</div>
					<div class="buttons">
						<button
							class="button cancel-button"
							[fsTranslate]="'app.premium.presubscribe-modal.cancel-button'"
							(click)="onCancelSubscribe()"
						></button>
						<button
							class="button subscribe-button"
							[fsTranslate]="'app.premium.presubscribe-modal.subscribe-button'"
							(click)="onSubscribe(model.planId)"
						></button>
					</div>
				</div>
			</div>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PremiumDesktopComponent extends AbstractSubscriptionComponent implements AfterViewInit {
	plans$: Observable<readonly PremiumPlan[]>;
	showLegacyPlan$: Observable<boolean>;
	showConfirmationPopUp$: Observable<UnsubscribeModel>;
	showPreSubscribeModal$: Observable<PresubscribeModel>;

	private showConfirmationPopUp$$ = new BehaviorSubject<UnsubscribeModel>(null);
	private showPreSubscribeModal$$ = new BehaviorSubject<PresubscribeModel>(null);

	constructor(
		protected readonly cdr: ChangeDetectorRef,
		private readonly subscriptionService: SubscriptionService,
		private readonly tebex: TebexService,
		private readonly owLegacyPremium: OwLegacyPremiumService,
		private readonly ads: AdService,
		private readonly i18n: LocalizationFacadeService,
		private readonly analytics: AnalyticsService,
	) {
		super(cdr);
	}

	async ngAfterViewInit() {
		await this.tebex.isReady();
		await this.owLegacyPremium.isReady();
		await this.ads.isReady();
		await this.subscriptionService.isReady();

		this.showConfirmationPopUp$ = this.showConfirmationPopUp$$.asObservable();
		this.showPreSubscribeModal$ = this.showPreSubscribeModal$$.asObservable();
		this.plans$ = combineLatest([this.tebex.packages$$, this.subscriptionService.currentPlan$$]).pipe(
			distinctUntilChanged((a, b) => deepEqual(a, b)),
			shareReplay(1),
			this.mapData(([packages, currentPlanSub]) => {
				console.debug('building plans');
				return ALL_PLANS.filter((plan) => currentPlanSub?.id === 'legacy' || plan.id !== 'legacy').map(
					(plan) => {
						const packageForPlan = packages?.find((p) => p.name.toLowerCase() === plan.id);
						return {
							...plan,
							price: packageForPlan?.total_price ?? plan.price,
							activePlan: currentPlanSub,
						} as PremiumPlan;
					},
				);
			}),
		);
		this.showLegacyPlan$ = this.plans$.pipe(this.mapData((plans) => plans.some((plan) => plan.id === 'legacy')));
		this.plans$.subscribe((plans) => {
			this.showPreSubscribeModal$$.next(null);
			this.showConfirmationPopUp$$.next(null);
		});

		if (!(this.cdr as ViewRef)?.destroyed) {
			this.cdr.detectChanges();
		}
	}

	async onUnsubscribeRequest(planId: string) {
		this.analytics.trackEvent('premium', { type: 'unsubscribe-request', planId: planId });
		const model: UnsubscribeModel = {
			planId: planId,
			title: this.i18n.translateString('app.premium.unsubscribe-modal.title', {
				plan: this.i18n.translateString(`app.premium.plan.${planId}`),
			}),
			text:
				planId === 'legacy'
					? this.i18n.translateString('app.premium.unsubscribe-modal.text-legacy')
					: this.i18n.translateString('app.premium.unsubscribe-modal.text'),
		};
		this.showConfirmationPopUp$$.next(model);
	}

	async onUnsubscribe(planId: string) {
		this.analytics.trackEvent('premium', { type: 'unsubscribe', planId: planId });
		const newModel: UnsubscribeModel = {
			...this.showConfirmationPopUp$$.getValue(),
			unsubscribing: true,
		};
		this.showConfirmationPopUp$$.next(newModel);
		console.log('unsubscribing from plan', planId);
		const result = await this.subscriptionService.unsubscribe(planId);
		console.log('unsubscribed from plan result', planId, result);
		this.showConfirmationPopUp$$.next(null);
	}

	onCancelUnsubscribe() {
		this.showConfirmationPopUp$$.next(null);
	}

	onSubscribeRequest(planId: string) {
		this.analytics.trackEvent('premium', { type: 'subscribe-request', planId: planId });
		const model: PresubscribeModel = {
			planId: planId,
			title: this.i18n.translateString('app.premium.presubscribe-modal.title', {
				plan: this.i18n.translateString(`app.premium.plan.${planId}`),
			}),
			text: this.i18n.translateString('app.premium.presubscribe-modal.text'),
		};
		this.showPreSubscribeModal$$.next(model);
	}

	async onSubscribe(planId: string) {
		this.analytics.trackEvent('premium', { type: 'subscribe', planId: planId });
		const result = await this.subscriptionService.subscribe(planId);
	}

	onCancelSubscribe() {
		this.showPreSubscribeModal$$.next(null);
	}
}

const ALL_PLANS: readonly Partial<PremiumPlan>[] = [
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
];

export interface PremiumPlan {
	readonly id: PremiumPlanId;
	readonly price: number;
	readonly features: {
		readonly supportFirestone?: boolean;
		readonly discordRole?: string;
		readonly removeAds?: boolean;
		readonly premiumFeatures?: boolean;
		readonly prioritySupport?: boolean;
	};
	readonly isReadonly?: boolean;
	readonly activePlan?: CurrentPlan;
	readonly text?: string;
}

interface UnsubscribeModel {
	readonly planId: string;
	readonly title: string;
	readonly text: string;
	readonly subscribing?: boolean;
	readonly unsubscribing?: boolean;
}
interface PresubscribeModel {
	readonly planId: string;
	readonly title: string;
	readonly text: string;
}
