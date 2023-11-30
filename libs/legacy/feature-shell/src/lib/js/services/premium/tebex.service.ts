import { Injectable } from '@angular/core';
import { SubscriberAwareBehaviorSubject } from '@firestone/shared/framework/common';
import { AbstractFacadeService, ApiRunner, AppInjector, WindowManagerService } from '@firestone/shared/framework/core';

const TEBEX_PACKAGES_URL = `https://subscriptions-api.overwolf.com/packages/t9wt-043c3ea78537238deb522bbc918ec940272175c0`;

@Injectable()
export class TebexService extends AbstractFacadeService<TebexService> {
	public packages$$: SubscriberAwareBehaviorSubject<readonly TebexPackage[] | null>;

	private api: ApiRunner;

	constructor(protected override readonly windowManager: WindowManagerService) {
		super(windowManager, 'tebex', () => !!this.packages$$);
	}

	protected override assignSubjects() {
		this.packages$$ = this.mainInstance.packages$$;
	}

	protected async init() {
		this.packages$$ = new SubscriberAwareBehaviorSubject<readonly TebexPackage[] | null>(null);
		this.api = AppInjector.get(ApiRunner);

		this.packages$$.onFirstSubscribe(async () => {
			console.log('[tebex] will load config');
			const result: readonly TebexPackage[] | null = await this.api.callGetApi(TEBEX_PACKAGES_URL);
			console.log('[tebex] loaded duels config');
			this.packages$$.next(result);
		});
	}
}

export interface TebexPackage {
	base_price: number;
	category: {
		id: number;
		name: string;
	};
	created_at: string;
	description: string;
	disable_gifting: boolean;
	disable_quantity: boolean;
	discount: number;
	expiration_date?: string;
	id: number;
	image?: string;
	name: string;
	sales_tax: number;
	total_price: number;
	type: 'subscription' | 'single';
	updated_at: string;
}
