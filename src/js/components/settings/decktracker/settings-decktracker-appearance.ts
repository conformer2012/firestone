import {
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	OnDestroy,
	ViewRef,
} from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { OverwolfService } from '../../../services/overwolf.service';
import { PreferencesService } from '../../../services/preferences.service';

@Component({
	selector: 'settings-decktracker-appearance',
	styleUrls: [
		`../../../../css/global/components-global.scss`,
		`../../../../css/global/scrollbar-settings.scss`,
		`../../../../css/global/forms.scss`,
		`../../../../css/component/settings/settings-common.component.scss`,
		`../../../../css/component/settings/decktracker/settings-decktracker-appearance.component.scss`,
	],
	template: `
		<div class="decktracker-appearance">
			<div class="settings-group">
				<div class="title">Display options</div>
				<preference-toggle
					field="overlayShowTitleBar"
					label="Show title bar"
					tooltip="Show/hide the deck name and cards left in hand and deck"
				></preference-toggle>
				<preference-toggle
					[field]="'overlayShowTooltipsOnHover'"
					[label]="'Show card tooltips'"
				></preference-toggle>
				<preference-toggle
					field="overlayGroupByZone"
					label="Group cards by zone"
					tooltip="When active, the tracker will split the cards into collapsable sections. The sections active today are Deck, Hand and Other"
				></preference-toggle>
				<preference-toggle
					field="overlayShowRarityColors"
					label="Show rarity colors"
					tooltip="When active, the mana cost of cards in the tracker will be colored based on the card's rarity"
				></preference-toggle>
				<preference-toggle
					*ngIf="!overlayGroupByZone"
					field="overlayCardsGoToBottom"
					label="Cards in deck at the top"
					tooltip="When active, the cards still in the deck are shown at the top of the list. It can only be activated if the Group cards by zone option is disabled"
				></preference-toggle>
				<preference-slider
					class="first-slider"
					[field]="'overlayWidthInPx'"
					[label]="'Overlay width'"
					[enabled]="sliderEnabled"
					[tooltip]="'Change the tracker width.'"
					[tooltipDisabled]="
						'Change the tracker width. This feature is only available when the tracker is displayed. Please launch a game, or activate the tracker for your curent mode.'
					"
					[min]="215"
					[max]="300"
				>
				</preference-slider>
				<preference-slider
					[field]="'decktrackerScale'"
					[label]="'Overlay size'"
					[enabled]="sliderEnabled"
					[tooltip]="'Change the tracker scale.'"
					[tooltipDisabled]="
						'Change the tracker scale. This feature is only available when the tracker is displayed. Please launch a game, or activate the tracker for your curent mode.'
					"
					[min]="75"
					[max]="200"
				>
				</preference-slider>
				<preference-slider
					[field]="'overlayOpacityInPercent'"
					[label]="'Overlay opacity'"
					[enabled]="sliderEnabled"
					[tooltip]="'Change the tracker opacity.'"
					[tooltipDisabled]="
						'Change the tracker opacity. This feature is only available when the tracker is displayed. Please launch a game, or activate the tracker for your curent mode.'
					"
					[min]="20"
					[max]="100"
				>
				</preference-slider>
			</div>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsDecktrackerAppearanceComponent implements AfterViewInit, OnDestroy {
	sliderEnabled = false;
	showTitleBar: boolean;
	overlayGroupByZone: boolean;

	private displaySubscription: Subscription;
	private preferencesSubscription: Subscription;

	constructor(private prefs: PreferencesService, private cdr: ChangeDetectorRef, private ow: OverwolfService) {}

	ngAfterViewInit() {
		this.loadDefaultValues();
		const displayEventBus: BehaviorSubject<any> = this.ow.getMainWindow().decktrackerDisplayEventBus;
		this.displaySubscription = displayEventBus.asObservable().subscribe(shouldDisplay => {
			// console.log('should display', shouldDisplay);
			this.sliderEnabled = shouldDisplay;
			if (!(this.cdr as ViewRef).destroyed) {
				this.cdr.detectChanges();
			}
		});

		const preferencesEventBus: BehaviorSubject<any> = this.ow.getMainWindow().preferencesEventBus;
		this.preferencesSubscription = preferencesEventBus.asObservable().subscribe(event => {
			this.overlayGroupByZone = event.preferences.overlayGroupByZone;
			if (!(this.cdr as ViewRef).destroyed) {
				this.cdr.detectChanges();
			}
		});
	}

	ngOnDestroy() {
		this.displaySubscription.unsubscribe();
		this.preferencesSubscription.unsubscribe();
	}

	private async loadDefaultValues() {
		const prefs = await this.prefs.getPreferences();
		this.overlayGroupByZone = prefs.overlayGroupByZone;
		this.showTitleBar = prefs.overlayShowTitleBar;
		if (!(this.cdr as ViewRef).destroyed) {
			this.cdr.detectChanges();
		}
	}
}
