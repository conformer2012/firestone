import {
	AfterContentInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	Inject,
	ViewRef,
} from '@angular/core';
import { PreferencesService } from '@firestone/shared/common/service';
import { AbstractSubscriptionComponent } from '@firestone/shared/framework/common';
import {
	ADS_SERVICE_TOKEN,
	AnalyticsService,
	IAdsService,
	ILocalizationService,
	OverwolfService,
	waitForReady,
} from '@firestone/shared/framework/core';
import { settingsDefinition } from '../models/settings-tree/settings-definition';
import { SettingContext, SettingNode } from '../models/settings.types';

@Component({
	selector: 'settings-root',
	styleUrls: [`../../settings-common.component.scss`, `./settings-root.component.scss`],
	template: `
		<div class="settings-root">
			<nav class="navigation" *ngIf="rootNode">
				<div class="header" [fsTranslate]="'settings.title'"></div>
				<ul class="nodes">
					<settings-navigation-node
						*ngFor="let child of rootNode.children"
						[node]="child"
						[indentLevel]="0"
					></settings-navigation-node>
				</ul>
			</nav>
			<div class="current-section">
				<settings-current-page></settings-current-page>
			</div>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsRootComponent extends AbstractSubscriptionComponent implements AfterContentInit {
	rootNode: SettingNode;

	constructor(
		protected override readonly cdr: ChangeDetectorRef,
		private readonly i18n: ILocalizationService,
		private readonly prefs: PreferencesService,
		private readonly analytics: AnalyticsService,
		private readonly ow: OverwolfService,
		@Inject(ADS_SERVICE_TOKEN) private readonly adService: IAdsService,
	) {
		super(cdr);
	}

	async ngAfterContentInit() {
		await waitForReady(this.prefs, this.adService);

		const context: SettingContext = {
			prefs: this.prefs,
			analytics: this.analytics,
			ow: this.ow,
			i18n: this.i18n,
			adService: this.adService,
			cdr: this.cdr,
		};
		this.rootNode = settingsDefinition(context);

		if (!(this.cdr as ViewRef).destroyed) {
			this.cdr.detectChanges();
		}
	}
}
