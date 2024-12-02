import { AfterContentInit, ChangeDetectorRef, Component, ElementRef, Input, Renderer2, ViewRef } from '@angular/core';
import { DeckCard, DeckState, Metadata } from '@firestone/game-state';
import { PreferencesService } from '@firestone/shared/common/service';
import { debounceTime, filter, takeUntil } from 'rxjs/operators';
import { DebugService } from '../../../services/debug.service';
import { AppUiStoreFacadeService } from '../../../services/ui-store/app-ui-store-facade.service';
import { AbstractSubscriptionStoreComponent } from '../../abstract-subscription-store.component';

@Component({
	selector: 'opponent-card-info',
	styleUrls: ['../../../../css/component/overlays/opponenthand/opponent-card-info.component.scss'],
	template: `
		<div class="opponent-card-info scalable" [style.left.vh]="leftVwOffset" [style.top.vh]="topVwOffset">
			<opponent-card-turn-number *ngIf="displayTurnNumber" [card]="card"></opponent-card-turn-number>
			<opponent-card-info-id
				*ngIf="displayGuess || displayBuff"
				[displayGuess]="displayGuess"
				[displayBuff]="displayBuff"
				[card]="card"
				[context]="context"
			></opponent-card-info-id>
		</div>
	`,
})
export class OpponentCardInfoComponent extends AbstractSubscriptionStoreComponent implements AfterContentInit {
	@Input() displayGuess: boolean;
	@Input() displayBuff: boolean;
	@Input() displayTurnNumber: boolean;
	// Weuse vh instead of vw here, because the height of the playing area is not affected when
	// you resize the window. The width on the other hand changes, because the border outside of
	// the play area are cropped
	@Input() leftVwOffset: number;
	@Input() topVwOffset: number;
	@Input() context: { deck: DeckState; metadata: Metadata; currentTurn: number | 'mulligan' };
	@Input() card: DeckCard;

	constructor(
		private readonly el: ElementRef,
		private readonly renderer: Renderer2,
		private readonly init_DebugService: DebugService,
		protected readonly store: AppUiStoreFacadeService,
		protected readonly cdr: ChangeDetectorRef,
		private readonly prefs: PreferencesService,
	) {
		super(store, cdr);
	}

	async ngAfterContentInit() {
		await this.prefs.isReady();

		this.prefs.preferences$$
			.pipe(
				debounceTime(100),
				this.mapData((prefs) => prefs.decktrackerOpponentHandScale),
				filter((scale) => !!scale),
				takeUntil(this.destroyed$),
			)
			.subscribe((scale) => {
				const newScale = scale / 100;
				const element = this.el.nativeElement.querySelector('.scalable');
				this.renderer.setStyle(element, 'transform', `scale(${newScale})`);
				if (!(this.cdr as ViewRef)?.destroyed) {
					this.cdr.detectChanges();
				}
			});

		if (!(this.cdr as ViewRef)?.destroyed) {
			this.cdr.detectChanges();
		}
	}
}
