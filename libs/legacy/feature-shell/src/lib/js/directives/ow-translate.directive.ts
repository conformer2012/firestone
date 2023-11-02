import { ChangeDetectorRef, Directive, ElementRef, Input, Optional } from '@angular/core';
import { OverwolfService, WindowManagerService } from '@firestone/shared/framework/core';
import { TranslateDirective, TranslateService } from '@ngx-translate/core';

@Directive({
	selector: '[owTranslate]',
})
export class OwTranslateDirective extends TranslateDirective {
	@Input() set owTranslate(key: string) {
		super.translate = key;
	}

	constructor(
		ow: OverwolfService,
		element: ElementRef,
		_ref: ChangeDetectorRef,
		// Used when OW is not available
		@Optional() translate: TranslateService,
		private readonly windowManager: WindowManagerService,
	) {
		const mainWindow = windowManager.getMainWindowSyncWithPossibleNull();
		const translateService: TranslateService = mainWindow?.translateService ?? translate;
		super(translateService, element, _ref);
		if (!mainWindow?.translateService) {
			this.postInit();
		}
	}

	private async postInit() {
		const mainWindow = await this.windowManager.getMainWindow();
		const translateService: TranslateService = mainWindow.translateService;
		if (!translateService) {
			this['translateService'] = translateService;
		}
	}
}
