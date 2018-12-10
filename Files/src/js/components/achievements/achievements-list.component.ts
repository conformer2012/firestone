import { Component, Input, ViewEncapsulation, ChangeDetectionStrategy, ChangeDetectorRef, HostListener, ElementRef, AfterViewInit, ViewRef, Output, EventEmitter } from '@angular/core';

import { AchievementSet } from '../../models/achievement-set';
import { VisualAchievement } from '../../models/visual-achievement';
import { IOption } from 'ng-select';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';

@Component({
	selector: 'achievements-list',
	styleUrls: [
		`../../../css/component/achievements/achievements-list.component.scss`,
		`../../../css/global/scrollbar-achievements.scss`,
	],
	encapsulation: ViewEncapsulation.None,
	template: `
		<div class="achievements-container {{headerClass}}">
			<div class="set-title">{{_achievementSet.displayName}}</div>
			<div class="show-filter">
				<ng-select
					class="filter"
					[options]="filterOptions"
					[(ngModel)]="activeFilter"
					(selected)="selectFilter($event)"
					(opened)="refresh()"
					(closed)="refresh()"
					[noFilter]="1">
					<ng-template #optionTemplate let-option="option">
						<span>{{option?.label}}</span>
						<i class="i-30 selected-icon" *ngIf="option.value == activeFilter">
							<svg class="svg-icon-fill">
								<use xlink:href="/Files/assets/svg/sprite.svg#selected_dropdown"/>
							</svg>
						</i>
					</ng-template>
				</ng-select>
				<achievement-progress-bar [achievementSet]="_achievementSet"></achievement-progress-bar>
			</div>
			<div class="collapse-menu {{headerClass}}" (click)="toggleMenu()">
				<i class="i-13X7" *ngIf="showCollapse">
					<svg class="svg-icon-fill">
						<use xlink:href="/Files/assets/svg/sprite.svg#collapse_caret"/>
					</svg>
				</i>
			</div>
			<ul class="achievements-list" 
					*ngIf="activeAchievements && activeAchievements.length > 0" 
					(scroll)="onScroll($event)">
				<li *ngFor="let achievement of activeAchievements; trackBy: trackByAchievementId ">
					<achievement-view 
							[attr.data-achievement-id]="achievement.id.toLowerCase()"
							[showReplays]="_achievementIdToScrollIntoView === achievement.id"
							(requestGlobalHeaderCollapse)="onRequestGlobalHeaderCollapse($event)"
							[achievement]="achievement">
					</achievement-view>
				</li>
			</ul>
			<section class="empty-state" *ngIf="!activeAchievements || activeAchievements.length === 0">
				<div class="state-container">
					<i class="i-236X165 pale-pink-theme" [innerHTML]="emptyStateSvgTemplate"></i>
					<span class="title">{{emptyStateTitle}}</span>
					<span class="subtitle">{{emptyStateText}}</span>
				</div>
			</section>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AchievementsListComponent implements AfterViewInit {

	readonly SCROLL_SHRINK_START_PX = 5 * 100;

	@Output() shortDisplay = new EventEmitter<boolean>();

	achievements: VisualAchievement[];
	activeAchievements: VisualAchievement[];
	_achievementSet: AchievementSet;
	filterOptions: Array<IOption>;
	activeFilter: string;
	emptyStateSvgTemplate: SafeHtml;
	emptyStateIcon: string;
	emptyStateTitle: string;
	emptyStateText: string;
	headerClass: string;
	showCollapse: boolean;

	_achievementIdToScrollIntoView: string;

	private lastScrollPosition: number = 0;
	private lastScrollPositionBeforeScrollDown: number = 0;
	private lastScrollPositionBeforeScrollUp: number = 0;
	private updatePending: boolean = false;

	constructor(private cdr: ChangeDetectorRef, private el: ElementRef, private domSanitizer: DomSanitizer) {

	}

	ngAfterViewInit() {
		let singleEls: HTMLElement[] = this.el.nativeElement.querySelectorAll('.single');
		singleEls.forEach((singleEl) => {
			let caretEl = singleEl.appendChild(document.createElement('i'));
			caretEl.innerHTML =
				`<svg class="svg-icon-fill">
					<use xlink:href="/Files/assets/svg/sprite.svg#arrow"/>
				</svg>`;
			caretEl.classList.add('i-30');
			caretEl.classList.add('caret');
		});
		setTimeout(() => {
			if (!(<ViewRef>this.cdr).destroyed) {
				this.cdr.detectChanges();
			}
		});
		this.shortDisplay.subscribe((data) => {
			this.headerClass = data ? 'shrink-header': undefined;
			this.cdr.detectChanges();
		})
	}

	@Input('achievementSet') set achievementSet(achievementSet: AchievementSet) {
		this._achievementSet = achievementSet;
		this.filterOptions = this._achievementSet.filterOptions
			.map((option) => ({ label: option.label, value: option.value }));
		this.activeFilter = this.filterOptions[0].value;
		console.log('updated achievementSet', achievementSet.id);
		this.updateShownAchievements();
	}

	@Input('achievementsList') set achievementsList(achievementsList: VisualAchievement[]) {
		this.achievements = achievementsList || [];
		console.log('updated achievementsList');
		this.updateShownAchievements();
	}

	@Input('achievementIdToScrollIntoView') set achievementIdToScrollIntoView(achievementIdToScrollIntoView: string) {
		console.log('setting achievementIdToScrollIntoView', achievementIdToScrollIntoView, this._achievementIdToScrollIntoView);
		this._achievementIdToScrollIntoView = achievementIdToScrollIntoView;
		this.updateShownAchievements();
	}

	toggleMenu() {
		if (this.headerClass) {
			this.shortDisplay.next(false);
		} 
		else {
			this.shortDisplay.next(true);
		}
	}
	
	// Prevent the window from being dragged around if user scrolls with click
	@HostListener('mousedown', ['$event'])
	onHistoryClick(event: MouseEvent) {
		// console.log('handling history click', event);
		const achievementsList = this.el.nativeElement.querySelector('.achievements-list');
		if (!achievementsList) {
			return;
		}
		let rect = achievementsList.getBoundingClientRect();
		// console.log('element rect', rect);
		let scrollbarWidth = 5;
		if (event.offsetX >= rect.width - scrollbarWidth) {
			event.stopPropagation();
		}
	}

	onScroll(event: Event) {
		// console.log('scrolling event', event);
		const elem = this.el.nativeElement.querySelector('.achievements-list');
		// console.log('showing header?', elem.scrollTop, this.lastScrollPosition, this.headerClass);
		if (elem.scrollTop > this.lastScrollPosition) {
			this.onScrollDown(elem.scrollTop);
		}
		else if (elem.scrollTop <= this.lastScrollPosition) {
			this.onScrollUp(elem.scrollTop);
		}
		this.lastScrollPosition = elem.scrollTop;
	}

	onRequestGlobalHeaderCollapse(request: boolean) {
		console.log('gloal header collapse request received', request);
		this.shortDisplay.next(request);
	}

	selectFilter(option: IOption) {
		this.activeFilter = option.value;
		this.updateShownAchievements();
	}

	trackByAchievementId(achievement: VisualAchievement, index: number) {
		return achievement.id;
	}

	refresh() {
		if (!(<ViewRef>this.cdr).destroyed) {
			this.cdr.detectChanges();
		}
	}

	private onScrollDown(scrollPosition: number) {
		this.lastScrollPositionBeforeScrollUp = scrollPosition;
		if (scrollPosition - this.lastScrollPositionBeforeScrollDown >= this.SCROLL_SHRINK_START_PX && !this.headerClass) {
			this.shortDisplay.next(true);
		}
	}

	private onScrollUp(scrollPosition: number) {
		this.lastScrollPositionBeforeScrollDown = scrollPosition;
		if (this.lastScrollPositionBeforeScrollUp - scrollPosition >= this.SCROLL_SHRINK_START_PX && this.headerClass) {
			this.shortDisplay.next(false);
		}
	}

	private updateShownAchievements() {
		if (!this.achievements || this.updatePending) {
			return;
		}
		this.updatePending = true;
		// Delay update so that it only runs once, once all inputs have been set
		// There probably is a better way of doing this though...
		setTimeout(() => this.doRealUpdate(), 100);
	}

	private doRealUpdate() {
		const filterOption = this._achievementSet.filterOptions
				.filter((option) => option.value === this.activeFilter)
				[0];
		const filterFunction: (VisualAchievement) => boolean = filterOption.filterFunction;
		this.emptyStateIcon = filterOption.emptyStateIcon;
		this.emptyStateTitle = filterOption.emptyStateTitle;
		this.emptyStateText = filterOption.emptyStateText;
		this.emptyStateSvgTemplate = this.domSanitizer.bypassSecurityTrustHtml(`
			<svg class="svg-icon-fill">
				<use xlink:href="/Files/assets/svg/sprite.svg#${this.emptyStateIcon}"/>
			</svg>
		`);
		this.activeAchievements = this.achievements.filter(filterFunction);
		console.log('selected', this.activeAchievements, filterOption);
		if (this._achievementIdToScrollIntoView) {
			this.shortDisplay.next(true);
			// Do the scrolling here
			const targetId = this._achievementIdToScrollIntoView.toLowerCase();
			const achievementToShow: Element = this.el.nativeElement.querySelector(`achievement-view[data-achievement-id=${targetId}]`);
			console.log('scrolling into view', this._achievementIdToScrollIntoView, achievementToShow);
			// const listElement: Element = this.el.nativeElement.querySelector('.achievements-list');
			// console.log('list element', listElement);
			achievementToShow.scrollIntoView(true);
			this._achievementIdToScrollIntoView = undefined;
		}
		this.showCollapse = this.activeAchievements.length > 0;
		this.updatePending = false;
		if (!(<ViewRef>this.cdr).destroyed) {
			this.cdr.detectChanges();
		}
	}
}
