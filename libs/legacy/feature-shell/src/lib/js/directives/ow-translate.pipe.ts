import { ChangeDetectorRef, Injectable, Optional, Pipe, PipeTransform } from '@angular/core';
import { OverwolfService, WindowManagerService } from '@firestone/shared/framework/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Injectable()
@Pipe({
	name: 'owTranslate',
	pure: false, // required to update the value when the promise is resolved
})
export class OwTranslatePipe extends TranslatePipe implements PipeTransform {
	constructor(
		ow: OverwolfService,
		_ref: ChangeDetectorRef,
		// Used when OW is not available
		@Optional() translate: TranslateService,
		private readonly windowManager: WindowManagerService,
	) {
		const mainWindow = windowManager.getMainWindowSyncWithPossibleNull();
		const translateService: TranslateService = mainWindow?.translateService ?? translate;
		super(translateService, _ref);
		if (!mainWindow?.translateService) {
			this.postInit();
		}
	}

	private async postInit() {
		const mainWindow = await this.windowManager.getMainWindow();
		const translateService: TranslateService = mainWindow.translateService;
		if (!translateService) {
			this['translate'] = translateService;
		}
	}
}
