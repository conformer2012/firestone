import {
	AfterContentInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	Renderer2,
	ViewRef,
} from '@angular/core';
import { SceneMode } from '@firestone-hs/reference-data';
import { Preferences, PreferencesService } from '@firestone/shared/common/service';
import { OverwolfService } from '@firestone/shared/framework/core';
import { Observable, combineLatest, tap } from 'rxjs';
import { ArenaDraftManagerService } from '../../services/arena/arena-draft-manager.service';
import { SceneService } from '../../services/game/scene.service';
import { AppUiStoreFacadeService } from '../../services/ui-store/app-ui-store-facade.service';
import { AbstractWidgetWrapperComponent } from './_widget-wrapper.component';

@Component({
	selector: 'arena-decktracker-ooc-widget-wrapper',
	styleUrls: [
		'../../../css/component/overlays/foreground-widget.component.scss',
		'../../../css/component/decktracker/overlay/decktracker-overlay.component.scss',
		'../../../css/component/overlays/decktracker-player-widget-wrapper.component.scss',
	],
	template: `
		<arena-decktracker-ooc
			class="widget"
			*ngIf="showWidget$ | async"
			cdkDrag
			(cdkDragStarted)="startDragging()"
			(cdkDragReleased)="stopDragging()"
			(cdkDragEnded)="dragEnded($event)"
		></arena-decktracker-ooc>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArenaDecktrackerOocWidgetWrapperComponent
	extends AbstractWidgetWrapperComponent
	implements AfterContentInit
{
	protected defaultPositionLeftProvider = (gameWidth: number, gameHeight: number) => gameWidth - 250;
	protected defaultPositionTopProvider = (gameWidth: number, gameHeight: number) => 10;
	protected positionUpdater = (left: number, top: number) => this.updatePosition(left, top);
	protected positionExtractor = async (prefs: Preferences) => prefs.arenaOocTrackerPosition;
	protected getRect = () => this.el.nativeElement.querySelector('.widget')?.getBoundingClientRect();
	protected bounds = {
		left: -100,
		right: -100,
		top: -50,
		bottom: -50,
	};

	showWidget$: Observable<boolean>;

	constructor(
		protected readonly ow: OverwolfService,
		protected readonly el: ElementRef,
		protected readonly prefs: PreferencesService,
		protected readonly renderer: Renderer2,
		protected readonly store: AppUiStoreFacadeService,
		protected readonly cdr: ChangeDetectorRef,
		private readonly scene: SceneService,
		private readonly draftManager: ArenaDraftManagerService,
	) {
		super(ow, el, prefs, renderer, store, cdr);
	}

	async ngAfterContentInit() {
		await this.scene.isReady();
		await this.draftManager.isReady();

		this.showWidget$ = combineLatest([
			this.store.listenPrefs$((prefs) => prefs.arenaShowOocTracker),
			this.scene.currentScene$$,
			this.draftManager.currentDeck$$,
		]).pipe(
			tap((data) => console.debug('[arena-decktracker-ooc-wrapper] data', data)),
			this.mapData(([[displayFromPrefs], currentScene, deck]) => {
				const result = displayFromPrefs && currentScene === SceneMode.DRAFT && deck?.DeckList?.length > 0;
				return result;
			}),
			this.handleReposition(),
		);

		if (!(this.cdr as ViewRef)?.destroyed) {
			this.cdr.detectChanges();
		}
	}

	private async updatePosition(left: number, top: number) {
		const prefs = await this.prefs.getPreferences();
		const newPrefs: Preferences = {
			...prefs,
			arenaOocTrackerPosition: { left, top },
		};
		await this.prefs.savePreferences(newPrefs);
	}
}
