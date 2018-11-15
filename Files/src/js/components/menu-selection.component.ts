import { Component, ChangeDetectionStrategy, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';

import { Events } from '../services/events.service';
import { FeatureFlags } from '../services/feature-flags.service';

declare var overwolf: any;

@Component({
	selector: 'menu-selection',
	styleUrls: [
		`../../css/global/menu.scss`,
		`../../css/component/menu-selection.component.scss`,
	],
	template: `
		<ul class="menu-selection">
			<li [ngClass]="{'selected': selectedModule == 'collection'}" (click)="selectModule('collection')">
				<span>The Binder</span>
			</li>
			<li [ngClass]="{'selected': selectedModule == 'achievements', 'disabled': !achievementsOn}" 
				(click)="selectModule('achievements')">
				<span>Achievements</span>
				<div class="zth-tooltip bottom" *ngIf="!achievementsOn">
					<p>Coming soon</p>
					<svg class="tooltip-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 9">
						<polygon points="0,0 8,-9 16,0"/>
					</svg>
				</div>
			</li>
			<li class="disabled">
				<span>Deck Tracker</span>
				<div class="zth-tooltip bottom">
					<p>Coming soon</p>
					<svg class="tooltip-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 9">
						<polygon points="0,0 8,-9 16,0"/>
					</svg>
				</div>
			</li>
		</ul>
	`,
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class MenuSelectionComponent {

	selectedModule: string = 'collection';
	achievementsOn: boolean;

	constructor(private events: Events, private cdr: ChangeDetectorRef, private flags: FeatureFlags) {
		this.events.on(Events.MODULE_SELECTED).subscribe((event) => {
			this.selectedModule = event.data[0];
			this.cdr.detectChanges();
		});
		this.events.on(Events.MODULE_IN_VIEW).subscribe((event) => {
			console.log('updating module in view', event);
			this.selectedModule = event.data[0];
			this.cdr.detectChanges();
		});
		this.achievementsOn = this.flags.achievements();
	}

	selectModule(module: string) {
		if (this.achievementsOn) {
			this.events.broadcast(Events.MODULE_SELECTED, module);
		}
	}
}
