/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Section, SectionReference, Setting, SettingButton, SettingNode } from '../models/settings.types';

export const filterSettings = (root: SettingNode, searchString: string | null): SettingNode => {
	if (!searchString?.length) {
		return root;
	}

	const result: SettingNode = {
		...root,
		children: root.children!.map((child) => filterNode(child, searchString)).filter((c) => !!c) as SettingNode[],
	};
	return result;
};

const filterNode = (node: SettingNode, searchString: string): SettingNode | null => {
	const result: SettingNode = {
		...node,
		sections: node.sections
			?.map((section) => filterSection(section, searchString))
			.filter((s) => !!s?.settings?.length)
			.filter((s) => !!s) as (Section | SectionReference)[],
		children: (node.children?.map((child) => filterNode(child, searchString)).filter((c) => !!c) ??
			[]) as SettingNode[],
	};

	if (!result?.sections?.length && !result.children?.length) {
		return null;
	}

	return result;
};

const filterSection = (section: Section | SectionReference, searchString: string): Section | null => {
	if (isSectionReference(section)) {
		return null;
	}

	const result: Section = {
		...section,
		settings: section.settings!.filter((setting) => settingMatches(setting, searchString)),
	};
	return result;
};

const settingMatches = (setting: Setting | SettingButton, searchString: string): boolean => {
	return (
		setting.label?.toLocaleLowerCase().includes(searchString.toLocaleLowerCase()) ||
		setting.keywords?.some((keyword) => keyword.toLocaleLowerCase().includes(searchString.toLocaleLowerCase())) ||
		false
	);
};

const isSectionReference = (section: Section | SectionReference): section is SectionReference => {
	return (section as SectionReference).componentType !== undefined;
};