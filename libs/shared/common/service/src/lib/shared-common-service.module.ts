import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedFrameworkCommonModule } from '@firestone/shared/framework/common';
import { AppNavigationService } from './services/app-navigation.service';
import { GameStatusService } from './services/game-status.service';
import { OwNotificationsService } from './services/notifications.service';
import { PreferencesStorageService } from './services/preferences-storage.service';
import { PreferencesService } from './services/preferences.service';

@NgModule({
	imports: [CommonModule, SharedFrameworkCommonModule],
	providers: [
		PreferencesService,
		PreferencesStorageService,
		AppNavigationService,
		GameStatusService,
		OwNotificationsService,
	],
})
export class SharedCommonServiceModule {}
