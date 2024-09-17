import { SettingContext, SettingNode } from '../settings.types';
import { generalSettings } from './general/_general-settings';

/**
 * TODO
 * - advanced settings toggle
 * - refresh for packs and achievements (in the Data section)
 */
export const settingsDefinition = (context: SettingContext): SettingNode => {
	return {
		id: 'root',
		name: context.i18n.translateString('settings.title'),
		keywords: null,
		children: [generalSettings(context)],
	};
};

export const findNode = (node: SettingNode, id: string | undefined): SettingNode | null => {
	if (!id) {
		return null;
	}
	if (node.id === id) {
		return node;
	}
	if (node.children) {
		for (const child of node.children) {
			const result = findNode(child, id);
			if (result) {
				return result;
			}
		}
	}
	return null;
};
