import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BattlegroundsSimulatorModule, BgsBattleSimulationExecutorService } from '@firestone/battlegrounds/simulator';
import { LegacyFeatureShellModule } from '@firestone/legacy/feature-shell';
import { SharedCommonServiceModule } from '@firestone/shared/common/service';
import { SharedFrameworkCoreModule } from '@firestone/shared/framework/core';
import { BgsBattlePositioningExecutorService } from '../../../../libs/legacy/feature-shell/src/lib/js/services/battlegrounds/bgs-battle-positioning-executor.service';
import { AppBoostrapperComponent } from './app-bootstrap.component';
import { BgsBattlePositioningWorkerService } from './impl/bgs-battle-positioning-worker.service';
import { BgsBattleSimulationWorkerService } from './impl/bgs-battle-simulation-worker.service';

@NgModule({
	declarations: [AppBoostrapperComponent],
	imports: [
		BrowserModule,
		LegacyFeatureShellModule,
		SharedFrameworkCoreModule,
		SharedCommonServiceModule,
		BattlegroundsSimulatorModule,
	],
	providers: [
		{ provide: BgsBattleSimulationExecutorService, useClass: BgsBattleSimulationWorkerService },
		{ provide: BgsBattlePositioningExecutorService, useClass: BgsBattlePositioningWorkerService },
	],
	bootstrap: [AppBoostrapperComponent],
})
export class AppModule {}
