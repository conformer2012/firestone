import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppNavigationService } from '@firestone/shared/common/service';
import { AnalyticsService } from '@firestone/shared/framework/core';

@Component({
	selector: 'arena-option-info-premium',
	styleUrls: ['./arena-option-info-premium.component.scss'],
	template: `
		<div
			class="info-premium"
			(click)="showPremium()"
			[helpTooltip]="'app.arena.draft.locked-premium-info-tooltip' | fsTranslate"
		>
			<div class="premium-lock">
				<svg>
					<use xlink:href="assets/svg/sprite.svg#lock" />
				</svg>
			</div>
			<div class="text" [fsTranslate]="'app.arena.draft.locked-premium-info'"></div>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArenaOptionInfoPremiumComponent {
	constructor(private readonly analytics: AnalyticsService, private readonly appNavigation: AppNavigationService) {}

	showPremium() {
		console.debug('show premium');
		this.analytics.trackEvent('subscription-click', { page: 'arena-card-pick' });
		this.appNavigation.goToPremium();
	}
}
