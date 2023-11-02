import { Injectable } from '@angular/core';
import { WindowManagerService } from '@firestone/shared/framework/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class SettingsCommunicationService {
	private settingsEventBus = new BehaviorSubject<[string, string]>(['general', null]);

	constructor(windowManager: WindowManagerService) {
		windowManager.registerGlobalService('settingsEventBus', this.settingsEventBus);
	}
}
