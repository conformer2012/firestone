import { Injectable } from '@angular/core';
import { SubscriberAwareBehaviorSubject } from '@firestone/shared/framework/common';
import {
	AbstractFacadeService,
	AppInjector,
	LocalStorageService,
	WindowManagerService,
} from '@firestone/shared/framework/core';
import { CustomAppearance, CustomStyleKey, FinalStyles, defaultStyleKeys } from '../models/custom-appearance';

@Injectable()
export class CustomAppearanceService extends AbstractFacadeService<CustomAppearanceService> {
	public colors$$: SubscriberAwareBehaviorSubject<CustomAppearance | null>;
	public finalStyles$$: SubscriberAwareBehaviorSubject<FinalStyles | null>;

	private localStorage: LocalStorageService;

	private internalSubject$$: SubscriberAwareBehaviorSubject<null>;

	constructor(protected override readonly windowManager: WindowManagerService) {
		super(windowManager, 'CustomAppearanceService', () => !!this.colors$$);
	}

	protected override assignSubjects() {
		this.colors$$ = this.mainInstance.colors$$;
		this.finalStyles$$ = this.mainInstance.finalStyles$$;
	}

	protected async init() {
		this.internalSubject$$ = new SubscriberAwareBehaviorSubject<null>(null);
		this.colors$$ = new SubscriberAwareBehaviorSubject<CustomAppearance | null>(null);
		this.finalStyles$$ = new SubscriberAwareBehaviorSubject<FinalStyles | null>(null);
		this.localStorage = AppInjector.get(LocalStorageService);

		this.colors$$.onFirstSubscribe(() => {
			this.internalSubject$$.subscribe();
		});
		this.finalStyles$$.onFirstSubscribe(() => {
			this.internalSubject$$.subscribe();
		});

		this.internalSubject$$.onFirstSubscribe(() => {
			const localColors =
				this.localStorage.getItem<CustomAppearance>(LocalStorageService.LOCAL_STORAGE_CUSTOM_APPEARANCE) ??
				({} as CustomAppearance);
			this.colors$$.next(localColors);

			this.colors$$.subscribe((colors) => {
				this.localStorage.setItem(LocalStorageService.LOCAL_STORAGE_CUSTOM_APPEARANCE, colors);
			});

			this.colors$$.subscribe((colors) => {
				if (!colors) {
					return;
				}

				// TODO: take the default from the current style sheet, instead of hard-coding it
				const bgsBackgroundColor = getStyle(colors, '--bgs-widget-background-color');
				const finalStyles: FinalStyles = {
					'--bgs-widget-background-image': `radial-gradient(30vw at 50% 50%, ${bgsBackgroundColor} 0%, rgba(30, 1, 22, 1) 100%),
		url('https://static.zerotoheroes.com/hearthstone/asset/firestone/images/backgrounds/battlegrounds.jpg')`,
				};
				console.debug('[custom-appearance] setting final styles', finalStyles);
				this.finalStyles$$.next(finalStyles);
			});
		});
	}

	public register() {
		this.finalStyles$$.subscribe((styles) => {
			if (!styles) {
				return;
			}

			// Set the CSS variables, for each key in the styles
			Object.keys(styles).forEach((key) => {
				window.document.documentElement.style.setProperty(key, styles[key]);
				console.debug('[custom-appearance] setting style', key, styles[key]);
			});
		});
	}

	public setColor(key: CustomStyleKey, value: string) {
		this.mainInstance.setColorInternal(key, value);
	}

	public setColorInternal(key: CustomStyleKey, value: string) {
		const currentColors = this.colors$$.value || {};
		this.colors$$.next({
			...currentColors,
			[key]: value,
		});
	}
}

const getStyle = (colors: CustomAppearance, key: CustomStyleKey) => {
	return colors[key] ?? defaultStyleKeys[key];
};
