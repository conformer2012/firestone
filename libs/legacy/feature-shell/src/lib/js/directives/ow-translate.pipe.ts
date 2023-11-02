import { ChangeDetectorRef, Injectable, Optional, Pipe, PipeTransform } from '@angular/core';
import { WindowManagerService } from '@firestone/shared/framework/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Injectable()
@Pipe({
	name: 'owTranslate',
	pure: false, // required to update the value when the promise is resolved
})
export class OwTranslatePipe extends TranslatePipe implements PipeTransform {
	constructor(
		_ref: ChangeDetectorRef,
		// Used when OW is not available
		@Optional() translate: TranslateService,
		windowManager: WindowManagerService,
	) {
		const translateService: TranslateService = windowManager.getGlobalService('translateService') ?? translate;
		super(translateService, _ref);
	}
}
