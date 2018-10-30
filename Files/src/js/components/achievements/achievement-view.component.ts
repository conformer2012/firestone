import { Component, Input, ChangeDetectionStrategy, ElementRef, ChangeDetectorRef } from '@angular/core';
import { VisualAchievement } from '../../models/visual-achievement';

@Component({
	selector: 'achievement-view',
	styleUrls: [`../../../css/component/achievements/achievement-view.component.scss`],
	template: `
		<div class="achievement-container" [ngClass]="{'missing': !achieved}">
			<div class="stripe" (click)="toggleRecordings()">
				<achievement-image [imageId]="_achievement.cardId"></achievement-image>
				<div class="achievement-body">
					<div class="text">
						<div class="achievement-name">{{_achievement.name}}</div>
						<div class="achievement-text" [innerHTML]="achievementText"></div>
					</div>
					<div class="completion-progress">
						<div class="completion-step" [ngClass]="{'completed': metTimes > 0}">
							<i class="i-30">
								<svg class="svg-icon-fill">
									<use xlink:href="/Files/assets/svg/sprite.svg#boss_encounter"/>
								</svg>
							</i>
							<div class="zth-tooltip bottom">
								<p>Boss encountered {{metTimes}} times</p>
								<svg class="tooltip-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 9">
									<polygon points="0,0 8,-9 16,0"/>
								</svg>
							</div>
						</div>
						<div class="completion-step" [ngClass]="{'completed': defeatedTimes > 0}">
						<i class="i-30">
							<svg class="svg-icon-fill">
								<use xlink:href="/Files/assets/svg/sprite.svg#boss_defeated"/>
							</svg>
						</i>
							<div class="zth-tooltip bottom">
								<p>Boss defeated {{defeatedTimes}} times</p>
								<svg class="tooltip-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 9">
									<polygon points="0,0 8,-9 16,0"/>
								</svg>
							</div>
						</div>
					</div>
				</div>
			</div>
			<achievement-recordings *ngIf="showRecordings" [achievement]="_achievement"></achievement-recordings>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AchievementViewComponent {

	_achievement: VisualAchievement;
	achievementText: string;
	achieved: boolean = false;
	metTimes: number;
	defeatedTimes: number;
	shouldScrollIntoView: boolean;
	showRecordings: boolean;

	@Input() set scrollIntoView(scroll: boolean) {
		this.shouldScrollIntoView = scroll;
		this.showRecordings = scroll;
		this.handleScrollIntoView();
	}

	@Input() set achievement(achievement: VisualAchievement) {
		this._achievement = achievement;
		this.achieved = this._achievement.numberOfCompletions.reduce((a, b) => a + b, 0) > 0;
		this.metTimes = this._achievement.numberOfCompletions[0];
		this.defeatedTimes = this._achievement.numberOfCompletions[1];
		this.achievementText = this._achievement.text;
		this.handleScrollIntoView();
	}

	constructor(private el: ElementRef, private cdr: ChangeDetectorRef) {
	}

	toggleRecordings() {
		console.log('toggling recordings?', this._achievement);
		if (this._achievement.replayInfo.length > 0) {
			this.showRecordings = !this.showRecordings;
			this.cdr.detectChanges();
		}
	}

	private handleScrollIntoView() {
		if (!this._achievement || !this.shouldScrollIntoView) {
			return;
		}
		console.log('scrolling into view', this._achievement.name);
		setTimeout(() => {
			this.el.nativeElement.scrollIntoView({ block: 'start', inline: 'nearest', behavior: 'smooth' });
			this.cdr.detectChanges();
		})
	}
}
