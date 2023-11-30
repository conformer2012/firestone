import { Injectable } from '@angular/core';
import {
	AbstractFacadeService,
	ApiRunner,
	AppInjector,
	OverwolfService,
	WindowManagerService,
} from '@firestone/shared/framework/core';

const UNSUB_URL = 'https://56ogovbpuj3wqndoj6j3fv3qs40ustlm.lambda-url.us-west-2.on.aws/';
const STATUS_URL = 'https://kb3ek7w47ofny2lhrnv7xlmxnq0ifkbj.lambda-url.us-west-2.on.aws/';

@Injectable()
export class OwLegacyPremiumService extends AbstractFacadeService<OwLegacyPremiumService> {
	private initialized = false;

	private api: ApiRunner;
	private ow: OverwolfService;

	constructor(protected override readonly windowManager: WindowManagerService) {
		super(windowManager, 'owLegacyPremium', () => this.initialized);
	}

	protected override assignSubjects() {
		this.initialized = true;
		// this.packages$$ = this.mainInstance.packages$$;
	}

	protected async init() {
		this.api = AppInjector.get(ApiRunner);
		this.ow = AppInjector.get(OverwolfService);
	}

	public async getSubscriptionStatus() {
		return this.mainInstance.getSubscriptionStatusInternal();
	}

	public async unsubscribe() {
		return this.mainInstance.unsubscribeInternal();
	}

	private async getSubscriptionStatusInternal() {
		const owToken = await this.ow.generateSessionToken();
		const result = await this.api.callPostApi(STATUS_URL, {
			owToken: owToken,
		});
		console.log('[ow-legacy-premium] sub status', result);
		return result;
	}

	private async unsubscribeInternal() {
		const owToken = await this.ow.generateSessionToken();
		const unsubResult = await this.api.callPostApi(UNSUB_URL, {
			owToken: owToken,
		});
		console.log('[ow-legacy-premium] unsub result', unsubResult);
		console.debug('[ow-legacy-premium] should show ads now?');
		return unsubResult;
	}
}
