import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DuelsGroupedDecks } from '../../../models/duels/duels-grouped-decks';
import { DuelsDeckStat } from '../../../models/duels/duels-player-stats';

@Component({
	selector: 'duels-grouped-top-decks',
	styleUrls: [
		`../../../../css/global/menu.scss`,
		`../../../../css/component/duels/desktop/duels-grouped-top-decks.component.scss`,
	],
	template: `
		<div class="grouped-decks">
			<div class="header">{{ header }}</div>
			<ul class="decks">
				<duels-deck-stat-vignette *ngFor="let stat of _groupedDecks" [stat]="stat"></duels-deck-stat-vignette>
			</ul>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DuelsGroupedTopDecksComponent {
	header: string;
	_groupedDecks: readonly DuelsDeckStat[];

	@Input() set groupedDecks(value: DuelsGroupedDecks) {
		this.header = value.header;
		this._groupedDecks = value.decks;
	}
}
