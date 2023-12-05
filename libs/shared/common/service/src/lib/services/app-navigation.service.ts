import { Injectable } from '@angular/core';
import { AbstractFacadeService, WindowManagerService } from '@firestone/shared/framework/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class AppNavigationService extends AbstractFacadeService<AppNavigationService> {
	public currentTab$$: BehaviorSubject<string | null>;

	constructor(protected override readonly windowManager: WindowManagerService) {
		super(windowManager, 'appNavigation', () => !!this.currentTab$$);
	}

	protected override assignSubjects() {
		this.currentTab$$ = this.mainInstance.currentTab$$;
	}

	protected async init() {
		this.currentTab$$ = new BehaviorSubject<string | null>(null);
	}

	public goToPremium() {
		this.selectTab('premium');
	}

	public selectTab(tab: string) {
		this.mainInstance.selectTabInternal(tab);
	}

	public selectTabInternal(tab: string) {
		console.debug('[navigation] selecting tab', tab);
		this.currentTab$$.next(tab);
	}
}
