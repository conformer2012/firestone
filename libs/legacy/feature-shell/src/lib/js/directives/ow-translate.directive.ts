import { ChangeDetectorRef, Directive, ElementRef, Input, Optional } from '@angular/core';
import { WindowManagerService } from '@firestone/shared/framework/core';
import { TranslateDirective, TranslateService } from '@ngx-translate/core';

@Directive({
	selector: '[owTranslate]',
})
export class OwTranslateDirective extends TranslateDirective {
	@Input() set owTranslate(key: string) {
		super.translate = key;
	}

	constructor(
		element: ElementRef,
		_ref: ChangeDetectorRef,
		// Used when OW is not available
		@Optional() translate: TranslateService,
		windowManager: WindowManagerService,
	) {
		const translateService: TranslateService = windowManager.getGlobalService('translateService') ?? translate;
		super(translateService, element, _ref);
	}
}
