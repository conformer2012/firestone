import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DuelsGeneralModule } from '@firestone/duels/general';
import { SharedCommonViewModule } from '@firestone/shared/common/view';
import { SharedFrameworkCoreModule } from '@firestone/shared/framework/core';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { VirtualScrollerModule } from 'ngx-virtual-scroller';
import { ArenaCardSearchComponent } from './components/card-stats/arena-card-search.component';
import { ArenaCardStatItemComponent } from './components/card-stats/arena-card-stat-item.component';
import { ArenaCardStatsComponent } from './components/card-stats/arena-card-stats.component';
import { ArenaClassInfoComponent } from './components/class-info/arena-class-info.component';
import { ArenaClassTierListTierComponent } from './components/class-info/arena-class-tier-list-tier.component';
import { ArenaClassTierListComponent } from './components/class-info/arena-class-tier-list.component';
import { ArenaCardOptionComponent } from './components/overlays/arena-card-option.component';
import { ArenaCardSelectionComponent } from './components/overlays/arena-card-selection.component';
import { ArenaHeroOptionComponent } from './components/overlays/arena-hero-option.component';
import { ArenaHeroSelectionComponent } from './components/overlays/arena-hero-selection.component';
import { ArenaOptionInfoPremiumComponent } from './components/overlays/arena-option-info-premium.component';
import { ArenaDeckDetailsComponent } from './components/runs/arena-deck-details.component';
import { ArenaCardStatsService } from './services/arena-card-stats.service';
import { ArenaClassStatsService } from './services/arena-class-stats.service';
import { ArenDeckDetailsService } from './services/arena-deck-details.service';
import { ArenaNavigationService } from './services/arena-navigation.service';

const components = [
	ArenaClassTierListComponent,
	ArenaClassTierListTierComponent,
	ArenaClassInfoComponent,
	ArenaCardStatsComponent,
	ArenaCardStatItemComponent,
	ArenaCardSearchComponent,
	ArenaHeroSelectionComponent,
	ArenaHeroOptionComponent,
	ArenaCardSelectionComponent,
	ArenaCardOptionComponent,
	ArenaOptionInfoPremiumComponent,
	ArenaDeckDetailsComponent,
];
@NgModule({
	imports: [
		CommonModule,

		VirtualScrollerModule,
		InlineSVGModule.forRoot(),

		SharedFrameworkCoreModule,
		SharedCommonViewModule,
		DuelsGeneralModule,
	],
	providers: [ArenaClassStatsService, ArenaCardStatsService, ArenaNavigationService, ArenDeckDetailsService],
	declarations: components,
	exports: components,
})
export class ArenaCommonModule {}
