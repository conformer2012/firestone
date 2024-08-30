import {
	AfterContentInit,
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	EventEmitter,
	Input,
	Output,
	Renderer2,
	ViewRef,
} from '@angular/core';
import { DeckState, GameState } from '@firestone/game-state';
import { CardTooltipPositionType } from '@firestone/shared/common/view';
import { CardsFacadeService } from '@firestone/shared/framework/core';
import { AbstractSubscriptionTwitchResizableComponent, TwitchPreferencesService } from '@firestone/twitch/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { CardsHighlightStandaloneService } from './cards-highlight-standalone.service';

@Component({
	selector: 'decktracker-overlay-standalone',
	styleUrls: [
		`../../../../../css/themes/decktracker-theme.scss`,
		`../../../../../css/global/cdk-overlay.scss`,
		'../../../../../css/component/decktracker/overlay/decktracker-overlay.component.scss',
		'./decktracker-overlay-standalone.component.scss',
	],
	template: `
		<div
			*ngIf="playerDeck && showTracker$ | async"
			class="root active decktracker-theme"
			[ngClass]="{ dragging: dragging }"
			[activeTheme]="'decktracker'"
			cdkDrag
			(cdkDragStarted)="startDragging()"
			(cdkDragReleased)="stopDragging()"
		>
			<div class="scalable">
				<div class="decktracker-container">
					<div class="decktracker" *ngIf="playerDeck">
						<decktracker-twitch-title-bar [deckState]="playerDeck"> </decktracker-twitch-title-bar>
						<decktracker-deck-list
							*ngIf="playerDeck?.deck?.length > 0"
							[deckState]="playerDeck"
							[displayMode]="displayMode$ | async"
							[tooltipPosition]="tooltipPosition"
							[showRelatedCards]="showRelatedCards$ | async"
							[colorManaCost]="colorManaCost$ | async"
							[darkenUsedCards]="true"
							[side]="'player'"
						>
						</decktracker-deck-list>
					</div>
				</div>
			</div>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeckTrackerOverlayStandaloneComponent
	extends AbstractSubscriptionTwitchResizableComponent
	implements AfterContentInit, AfterViewInit
{
	@Output() dragStart = new EventEmitter<void>();
	@Output() dragEnd = new EventEmitter<void>();

	displayMode$: Observable<'DISPLAY_MODE_ZONE' | 'DISPLAY_MODE_GROUPED'>;
	showRelatedCards$ = new Observable<boolean>();
	showTracker$: Observable<boolean>;
	colorManaCost$: Observable<boolean>;

	@Input() set gameState(value: GameState) {
		this.playerDeck = value?.playerDeck;
		this.gameState$$.next(
			GameState.create({
				...value,
				playerDeck: this.playerDeck,
			}),
		);
	}

	playerDeck: DeckState;
	dragging: boolean;
	tooltipPosition: CardTooltipPositionType = 'left';

	private gameState$$ = new BehaviorSubject<GameState>(null);

	constructor(
		protected readonly cdr: ChangeDetectorRef,
		protected readonly prefs: TwitchPreferencesService,
		protected readonly el: ElementRef,
		protected readonly renderer: Renderer2,
		private readonly allCards: CardsFacadeService,
		private readonly highlightService: CardsHighlightStandaloneService,
	) {
		super(cdr, prefs, el, renderer);
	}

	ngAfterContentInit() {
		this.displayMode$ = this.prefs.prefs
			.asObservable()
			.pipe(this.mapData((prefs) => (prefs?.useModernTracker ? 'DISPLAY_MODE_ZONE' : 'DISPLAY_MODE_GROUPED')));
		this.showRelatedCards$ = this.prefs.prefs.asObservable().pipe(this.mapData((prefs) => prefs?.showRelatedCards));
		this.showTracker$ = this.prefs.prefs.asObservable().pipe(this.mapData((prefs) => prefs?.decktrackerOpen));
		this.colorManaCost$ = this.prefs.prefs
			.asObservable()
			.pipe(this.mapData((prefs) => prefs?.decktrackerColorManaCost));
		this.highlightService.setup(this.gameState$$);
	}

	ngAfterViewInit() {
		super.listenForResize();
	}

	protected postResize() {
		this.keepOverlayInBounds();
	}

	private keepOverlayInBounds() {
		return;
		setTimeout(() => {
			try {
				// Move the tracker so that it doesn't go over the edges
				const rect = this.el.nativeElement.querySelector('.scalable').getBoundingClientRect();
				const parentRect = this.el.nativeElement.parentNode.getBoundingClientRect();
				// Get current transform values
				const transform = window.getComputedStyle(this.el.nativeElement.querySelector('.root')).transform;
				const matrix = new DOMMatrix(transform);
				const matrixCurrentLeftMove = matrix.m41;
				const matrixCurrentTopMove = matrix.m42;
				let newTranslateLeft = matrixCurrentLeftMove;
				let newTranslateTop = matrixCurrentTopMove;
				if (rect.left < 0) {
					// We move it so that the left is 0
					const amountToMove = Math.abs(rect.left);
					newTranslateLeft = matrixCurrentLeftMove + amountToMove;
				} else if (rect.right > parentRect.right) {
					const amountToMove = rect.right - parentRect.right;
					newTranslateLeft = matrixCurrentLeftMove - amountToMove;
				}
				if (rect.top < 0) {
					const amountToMove = Math.abs(rect.top);
					newTranslateTop = matrixCurrentTopMove + amountToMove;
				} else if (rect.bottom > parentRect.bottom) {
					const amountToMove = rect.bottom - parentRect.bottom;
					newTranslateTop = matrixCurrentTopMove - amountToMove;
				}
				const newTransform = `translate3d(${newTranslateLeft}px, ${newTranslateTop}px, 0px)`;
				this.renderer.setStyle(this.el.nativeElement.querySelector('.root'), 'transform', newTransform);
			} catch (e) {
				// Usually happens in edge where DOMMatrix is not defined
				console.warn('Exception while keeping overlay in bounds', e);
			}
			// this.cdr.detectChanges();
		});
	}

	startDragging() {
		this.tooltipPosition = 'none';
		this.dragging = true;

		// this.events.broadcast(Events.HIDE_TOOLTIP);
		this.dragStart.next();
		if (!(this.cdr as ViewRef)?.destroyed) {
			this.cdr.detectChanges();
		}
	}

	async stopDragging() {
		this.dragging = false;

		this.dragEnd.next();
		await this.updateTooltipPosition();
		if (!(this.cdr as ViewRef)?.destroyed) {
			this.cdr.detectChanges();
		}
		this.keepOverlayInBounds();
	}

	private async updateTooltipPosition() {
		// Move the tracker so that it doesn't go over the edges
		const rect = this.el.nativeElement.querySelector('.scalable').getBoundingClientRect();
		if (rect.left < 300) {
			this.tooltipPosition = 'right';
		} else {
			this.tooltipPosition = 'left';
		}

		if (!(this.cdr as ViewRef)?.destroyed) {
			this.cdr.detectChanges();
		}
	}
}
