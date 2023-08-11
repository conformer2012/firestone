import { Season } from './_season';
import { Season1 } from './season-1';
import { Season2 } from './season-2';
import { Season3 } from './season-3';
import { Season4 } from './season-4';
import { Season5 } from './season-5';
import { Season6 } from './season-6';
import { Season7 } from './season-7';
import { Season8 } from './season-8';
import { Season9 } from './season-9';

export const xpSeason1 = new Season1();
export const xpSeason2 = new Season2();
export const xpSeason3 = new Season3();
export const xpSeason4 = new Season4();
export const xpSeason5 = new Season5();
export const xpSeason6 = new Season6();
export const xpSeason7 = new Season7();
export const xpSeason8 = new Season8();
export const xpSeason9 = new Season9();

export const allSeasons: readonly Season[] = [
	xpSeason1,
	xpSeason2,
	xpSeason3,
	xpSeason4,
	xpSeason5,
	xpSeason6,
	xpSeason7,
	xpSeason8,
	xpSeason9,
];

export const computeXpFromLevel = (fullLevel: string, timestamp: number): number => {
	if (!fullLevel.includes('-')) {
		return;
	}

	const [level, xpInLevel] = fullLevel.split('-').map((info) => parseInt(info));
	const season: Season = getSeason(timestamp);
	if (!season) {
		return 0;
	}

	const baseXp = season.getXpForLevel(level) ?? 0;
	return baseXp + xpInLevel;
};

export const getSeason = (timestamp: number): Season => {
	for (const season of [...allSeasons].reverse()) {
		if (timestamp >= season.startDate.getTime()) {
			return season;
		}
	}
	return null;
};
