import {
	AfterContentInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	HostListener,
	Input,
	OnDestroy,
	Renderer2,
	ViewRef,
} from '@angular/core';
import { encodeMercs, MercenariesTeamDefinition, MercenaryDefinition } from '@firestone-hs/deckstrings';
import { VillageVisitorType } from '@firestone-hs/reference-data';
import { MercenariesReferenceData } from '@firestone-hs/trigger-process-mercenaries-review/dist/process-mercenaries-review';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { debounceTime, filter, map, takeUntil, tap } from 'rxjs/operators';
import { CardTooltipPositionType } from '../../../../directives/card-tooltip-position.type';
import { MemoryMercenariesCollectionInfo } from '../../../../models/memory/memory-mercenaries-collection-info';
import { MercenariesBattleTeam } from '../../../../models/mercenaries/mercenaries-battle-state';
import { Preferences } from '../../../../models/preferences';
import { CardsFacadeService } from '../../../../services/cards-facade.service';
import { LocalizationFacadeService } from '../../../../services/localization-facade.service';
import { isMercenariesPvP } from '../../../../services/mercenaries/mercenaries-utils';
import { OverwolfService } from '../../../../services/overwolf.service';
import { AppUiStoreFacadeService } from '../../../../services/ui-store/app-ui-store-facade.service';
import { cdLog } from '../../../../services/ui-store/app-ui-store.service';
import { AbstractSubscriptionComponent } from '../../../abstract-subscription.component';

@Component({
	selector: 'mercenaries-team-root',
	styleUrls: [
		'../../../../../css/global/components-global.scss',
		`../../../../../css/global/cdk-overlay.scss`,
		`../../../../../css/themes/decktracker-theme.scss`,
		'../../../../../css/component/mercenaries/overlay/teams/mercenaries-team-root.component.scss',
	],
	template: `
		<div class="root {{ side }}">
			<!-- Never remove the scalable from the DOM so that we can perform resizing even when not visible -->
			<div class="scalable">
				<div class="team-container">
					<div class="team" *ngIf="_team" [style.width.px]="overlayWidthInPx">
						<div class="background"></div>
						<mercenaries-team-control-bar [side]="side"></mercenaries-team-control-bar>
						<div class="header" *ngIf="showTurnCounter$ | async">
							<div class="label" [owTranslate]="'mercenaries.team-widget.turn-counter.turns'"></div>
							<div
								class="element battle-turn"
								[helpTooltip]="
									'mercenaries.team-widget.turn-counter.current-battle-turn-tooltip' | owTranslate
								"
							>
								<svg class="icon svg-icon-fill">
									<use xlink:href="assets/svg/sprite.svg#sword" />
								</svg>
								<div class="value ">
									{{ currentBattleTurn$ | async }}
								</div>
							</div>
							<div class="element map-turn" [helpTooltip]="mapTurnsTooltip$ | async">
								<div class="icon" inlineSVG="assets/svg/map.svg"></div>
								<div class="value ">
									{{ totalMapTurns$ | async }}
								</div>
							</div>
						</div>
						<mercenaries-team-list [team]="_team" [tooltipPosition]="tooltipPosition">
						</mercenaries-team-list>
						<div class="footer">
							<div
								class="mouseover-button show-tasks"
								*ngIf="showTasks$ | async"
								(mouseenter)="showTasks()"
								(mouseleave)="hideTasks()"
							>
								<div class="background-main-part"></div>
								<div class="background-second-part"></div>
								<div class="content">
									<div class="icon" inlineSVG="assets/svg/created_by.svg"></div>
									{{ 'mercenaries.team-widget.tasks-button' | owTranslate }}
								</div>
								<mercs-tasks-list
									class="task-list {{ tooltipPosition }}"
									[ngClass]="{ 'visible': showTaskList$ | async }"
									[style.bottom.px]="taskListBottomPx"
									[tasks]="_tasks"
									[taskTeamDeckstring]="taskTeamDeckstring"
								></mercs-tasks-list>
							</div>

							<div
								class="mouseover-button show-roles-matchup-button"
								[cardTooltip]="'merceanries_weakness_triangle'"
								[cardTooltipPosition]="tooltipPosition"
								[cardTooltipClass]="'mercenaries-weakness-triangle'"
								[cardTooltipLocalized]="false"
								*ngIf="showColorChart$ | async"
							>
								<div class="background-second-part"></div>
								<div class="background-main-part"></div>
								<div class="content">
									<div class="icon" inlineSVG="assets/svg/created_by.svg"></div>
									{{ 'mercenaries.team-widget.roles-chart-button' | owTranslate }}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MercenariesTeamRootComponent extends AbstractSubscriptionComponent implements AfterContentInit, OnDestroy {
	@Input() side: 'player' | 'opponent' | 'out-of-combat-player';
	@Input() showTasksExtractor: (prefs: Preferences) => boolean;
	@Input() scaleExtractor: (prefs: Preferences) => number;

	@Input() set team(value: MercenariesBattleTeam) {
		this._team = value;
		this.updateTaskListBottomPx();
		if (!(this.cdr as ViewRef)?.destroyed) {
			this.cdr.detectChanges();
		}
	}

	@Input() set tasks(value: readonly Task[]) {
		if (!value) {
			return;
		}
		this._tasks = value;
		this.taskTeamDeckstring = this.buildTeamForTasks();
		this.updateTaskListBottomPx();
		if (!(this.cdr as ViewRef)?.destroyed) {
			this.cdr.detectChanges();
		}
	}

	@Input() tooltipPosition: CardTooltipPositionType = 'left';

	@Input() set showTurnCounter(value: boolean) {
		this.showTurnCounter$$.next(value);
	}

	showColorChart$: Observable<boolean>;
	showTasks$: Observable<boolean>;
	showTaskList$: Observable<boolean>;
	showTurnCounter$: Observable<boolean>;
	currentBattleTurn$: Observable<number>;
	totalMapTurns$: Observable<string>;
	mapTurnsTooltip$: Observable<string>;

	_team: MercenariesBattleTeam;
	_tasks: readonly Task[];
	taskTeamDeckstring: string;

	overlayWidthInPx = 225;
	taskListBottomPx = 0;

	private scale: Subscription;
	private showTaskList$$ = new BehaviorSubject<boolean>(false);
	private showTurnCounter$$ = new BehaviorSubject<boolean>(false);

	private mercReferenceData: MercenariesReferenceData;
	private mercCollectionInfo: MemoryMercenariesCollectionInfo;

	constructor(
		protected readonly store: AppUiStoreFacadeService,
		protected readonly cdr: ChangeDetectorRef,
		private readonly el: ElementRef,
		private readonly renderer: Renderer2,
		private readonly i18n: LocalizationFacadeService,
		private readonly allCards: CardsFacadeService,
		private readonly ow: OverwolfService,
	) {
		super(store, cdr);
	}

	ngAfterContentInit(): void {
		this.store
			.listen$(([main, nav]) => main.mercenaries.referenceData)
			.pipe(this.mapData(([info]) => info))
			.subscribe((info) => {
				this.mercReferenceData = info;
				this.buildTeamForTasks();
			});
		this.store
			.listen$(([main, nav]) => main.mercenaries.collectionInfo)
			.pipe(this.mapData(([info]) => info))
			.subscribe((info) => (this.mercCollectionInfo = info));
		this.showColorChart$ = this.store
			.listenPrefs$((prefs) => prefs.mercenariesShowColorChartButton)
			.pipe(
				map(([pref]) => pref),
				// FIXME
				tap((filter) => setTimeout(() => this.cdr.detectChanges(), 0)),
				tap((filter) => cdLog('emitting showColorChart in ', this.constructor.name, filter)),
				takeUntil(this.destroyed$),
			);
		this.scale = this.store
			.listenPrefs$((prefs) => (!!this.scaleExtractor ? this.scaleExtractor(prefs) : null))
			.pipe(
				debounceTime(100),
				map(([pref]) => pref),
				filter((scale) => !!scale),
				takeUntil(this.destroyed$),
			)
			.subscribe((scale) => {
				this.el.nativeElement.style.setProperty('--decktracker-scale', scale / 100);
				this.el.nativeElement.style.setProperty('--decktracker-max-height', '90vh');
				const newScale = scale / 100;
				const element = this.el.nativeElement.querySelector('.scalable');
				this.renderer.setStyle(element, 'transform', `scale(${newScale})`);
				if (!(this.cdr as ViewRef)?.destroyed) {
					this.cdr.detectChanges();
				}
			});
		this.showTasks$ = combineLatest(
			this.store.listenMercenaries$(([battleState, prefs]) => battleState?.gameMode),
			this.store.listenPrefs$((prefs) => (this.showTasksExtractor ? this.showTasksExtractor(prefs) : null)),
		).pipe(
			// Because when out of combat
			map(([[gameMode], [pref]]) => pref && !isMercenariesPvP(gameMode)),
			// FIXME
			tap((filter) => setTimeout(() => this.cdr.detectChanges(), 0)),
			tap((filter) => cdLog('emitting showTasks in ', this.constructor.name, filter)),
			takeUntil(this.destroyed$),
		);
		this.showTaskList$ = this.showTaskList$$.asObservable().pipe(
			map((info) => info),
			tap((filter) => setTimeout(() => this.cdr.detectChanges(), 0)),
			tap((filter) => cdLog('emitting showTaskList in ', this.constructor.name, filter)),
			takeUntil(this.destroyed$),
		);
		this.showTurnCounter$ = this.showTurnCounter$$.asObservable();
		this.currentBattleTurn$ = this.store
			.listenMercenaries$(([state, prefs]) => state?.currentTurn)
			.pipe(
				// One turn is logged between each phase (order selection and combat)
				this.mapData(([currentTurn]) => Math.ceil((isNaN(+currentTurn) ? 0 : +currentTurn) / 2)),
			);
		this.totalMapTurns$ = combineLatest(
			this.currentBattleTurn$,
			this.store.listen$(([main, nav]) => main.mercenaries.mapInfo?.Map?.TurnsTaken),
		).pipe(
			this.mapData(([currentBattleTurn, [totalMapTurns]]) =>
				totalMapTurns == null ? '?' : '' + ((totalMapTurns ?? 0) + (currentBattleTurn ?? 0)),
			),
		);
		this.mapTurnsTooltip$ = this.totalMapTurns$.pipe(
			this.mapData((turns) =>
				turns === '?'
					? this.i18n.translateString('mercenaries.team-widget.turn-counter.total-map-turns-error-tooltip')
					: this.i18n.translateString('mercenaries.team-widget.turn-counter.total-map-turns-tooltip'),
			),
		);
	}

	trackByTaskFn(index: number, task: Task) {
		return task.description;
	}

	private updateTaskListBottomPx() {
		setTimeout(() => {
			const taskListEl = this.el.nativeElement.querySelector('.task-list');
			if (!taskListEl) {
				return;
			}

			const taskEls = this.el.nativeElement.querySelectorAll('.task');
			if (taskEls?.length != this._tasks?.length) {
				setTimeout(() => this.updateTaskListBottomPx(), 100);
				return;
			}

			const rect = taskListEl.getBoundingClientRect();
			const taskListHeight = rect.height;
			const widgetEl = this.el.nativeElement.querySelector('.team-container');
			const widgetRect = widgetEl.getBoundingClientRect();
			const widgetHeight = widgetRect.height;
			this.taskListBottomPx = widgetHeight > taskListHeight ? 0 : widgetHeight - taskListHeight;
			if (!(this.cdr as ViewRef)?.destroyed) {
				this.cdr.detectChanges();
			}
		}, 100);
	}

	@HostListener('window:beforeunload')
	ngOnDestroy() {
		super.ngOnDestroy();
		this.scale?.unsubscribe();
	}

	showTasks() {
		this.showTaskList$$.next(true);
	}

	hideTasks() {
		this.showTaskList$$.next(false);
	}

	private buildTeamForTasks(): string {
		console.debug('building team for tasks', this._tasks, this.mercReferenceData);
		if (!this.mercReferenceData?.mercenaries?.length || !this._tasks?.length) {
			console.warn('missing reference data');
			return null;
		}

		const definition: MercenariesTeamDefinition = {
			teamId: 1,
			type: 1,
			name: 'Tasks team',
			mercenaries: this._tasks
				.filter((task) => task.type === VillageVisitorType.STANDARD)
				.map((task) => {
					const mercDbfId = this.allCards.getCard(task.mercenaryCardId)?.dbfId;
					const refMerc = this.mercReferenceData.mercenaries.find((merc) => merc.cardDbfId === mercDbfId);
					if (!refMerc) {
						return null;
					}

					const memMerc = this.mercCollectionInfo?.Mercenaries?.find((m) => m.Id === refMerc.id);
					const equipmentId =
						(memMerc?.Equipments ?? []).find((e) => e.Equipped)?.Id ??
						[...(memMerc?.Equipments ?? [])].sort((a, b) => b.Tier - a.Tier)[0]?.Id ??
						refMerc.equipments[0]?.equipmentId;
					console.debug('equipmentId', equipmentId, memMerc?.Equipments);
					const result: MercenaryDefinition = {
						mercenaryId: refMerc.id,
						selectedArtVariationId: 0,
						selectedArtVariationPremium: 0,
						selectedEquipmentId: equipmentId,
						sharedTeamMercenaryIsFullyUpgraded: 0,
						sharedTeamMercenaryXp: 0,
					};
					return result;
				})
				.filter((m) => !!m),
		};
		if (!definition?.mercenaries?.length) {
			return null;
		}

		console.debug('mercs definition', definition);
		const deckstring = encodeMercs(definition);
		return deckstring;
	}
}

@Component({
	selector: 'mercs-tasks-list',
	styleUrls: [
		'../../../../../css/global/components-global.scss',
		`../../../../../css/themes/decktracker-theme.scss`,
		'../../../../../css/component/mercenaries/overlay/teams/mercenaries-team-root.component.scss',
	],
	template: `
		<div class="tasks-container">
			<ng-container *ngIf="tasks?.length; else emptyState">
				<div class="task" *ngFor="let task of tasks; trackBy: trackByTaskFn">
					<div class="portrait" *ngIf="task.mercenaryCardId" [cardTooltip]="task.mercenaryCardId">
						<img class="art" [src]="task.portraitUrl" />
						<img class="frame" *ngIf="task.frameUrl" [src]="task.frameUrl" />
					</div>
					<div class="task-content">
						<div class="header">{{ task.header }}</div>
						<div class="description">{{ task.description }}</div>
						<div class="progress">
							<div class="background"></div>
							<div class="current-progress" [style.width.%]="task.progressPercentage"></div>
							<div class="text">{{ task.progress }} / {{ task.quota }}</div>
						</div>
					</div>
				</div>
				<div class="create-team-button" *ngIf="taskTeamDeckstring">
					<button
						[helpTooltip]="buttonTooltip"
						(click)="createTeamFromTasks()"
						[ngClass]="{ 'disabled': isCopied }"
					>
						{{ buttonLabel }}
					</button>
				</div>
			</ng-container>
			<ng-template #emptyState
				><div class="empty-state" [owTranslate]="'mercenaries.team-widget.tasks-completed'"></div>
			</ng-template>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MercsTasksListComponent {
	@Input() tasks: readonly Task[];
	@Input() taskTeamDeckstring: string;

	isCopied: boolean;
	buttonLabel = this.i18n.translateString('mercenaries.team-widget.create-team-button-label');
	buttonTooltip = this.i18n.translateString('mercenaries.team-widget.create-team-button-tooltip');

	constructor(
		private readonly ow: OverwolfService,
		private readonly i18n: LocalizationFacadeService,
		private readonly cdr: ChangeDetectorRef,
	) {}

	createTeamFromTasks() {
		if (this.isCopied) {
			return;
		}

		this.isCopied = true;
		this.ow.placeOnClipboard(this.taskTeamDeckstring);
		this.buttonLabel = this.i18n.translateString('mercenaries.team-widget.create-team-button-ok-label');
		if (!(this.cdr as ViewRef)?.destroyed) {
			this.cdr.detectChanges();
		}
		setTimeout(() => {
			this.buttonLabel = this.i18n.translateString('mercenaries.team-widget.create-team-button-label');
			this.isCopied = false;
			if (!(this.cdr as ViewRef)?.destroyed) {
				this.cdr.detectChanges();
			}
		}, 5000);
	}
}

export interface Task {
	readonly mercenaryCardId: string;
	readonly mercenaryRole: 'TANK' | 'CASTER' | 'FIGHTER';
	readonly mercenaryName: string;
	readonly title: string;
	readonly header: string;
	readonly description: string;
	readonly taskChainProgress: number;
	readonly progress: number;
	readonly portraitUrl?: string;
	readonly frameUrl?: string;
	readonly type: VillageVisitorType;
}
