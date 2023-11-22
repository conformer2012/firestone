import { NonFunctionProperties } from '@firestone/shared/framework/common';
import { ArenaCategory } from '../mainwindow/arena/arena-category';

export class ArenaState {
	readonly loading: boolean = true;
	readonly categories: readonly ArenaCategory[] = [];

	public static create(base: Partial<NonFunctionProperties<ArenaState>>): ArenaState {
		return Object.assign(new ArenaState(), base);
	}

	public update(base: Partial<NonFunctionProperties<ArenaState>>): ArenaState {
		return Object.assign(new ArenaState(), this, base);
	}

	public findCategory(categoryId: string): ArenaCategory {
		const result = this.categories?.find((cat) => cat.id === categoryId);
		return result;
	}
}
