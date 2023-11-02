import { sleep } from '@firestone/shared/framework/common';
import { WindowManagerService } from './window-manager.service';

export abstract class AbstractFacadeService<T extends AbstractFacadeService<T>> {
	protected mainInstance: T;

	constructor(
		protected readonly windowManager: WindowManagerService,
		private readonly serviceName: string,
		private readonly readyCheck: () => boolean,
	) {
		this.initFacade();
	}

	public async isReady() {
		while (!this.readyCheck()) {
			await sleep(50);
		}
	}

	private async initFacade() {
		const existingService = await this.windowManager.getGlobalService<T>(this.serviceName);
		if (!existingService) {
			this.windowManager.registerGlobalService(this.serviceName, this);
			this.mainInstance = this as unknown as T;
			this.init();
		} else {
			this.mainInstance = existingService;
			this.assignSubjects();
		}
	}

	protected abstract assignSubjects(): void;
	protected abstract init(): void | Promise<void>;
}
