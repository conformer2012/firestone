import { Route } from '@angular/router';
import { WebsiteBattlegroundsComponent } from '@firestone/website/battlegrounds';
import { WebsiteAuthComponent, WebsitePremiumComponent } from '@firestone/website/core';
import {
	WebsiteDuelsHeroesComponent,
	WebsiteDuelsHeroPowersComponent,
	WebsiteDuelsSignatureTreasuresComponent,
} from '@firestone/website/duels';
import { AuthGuard } from './auth-guard.service';
import { PremiumRedirectGuard } from './premium-redirect.service';

export const appRoutes: Route[] = [
	{
		path: 'battlegrounds',
		component: WebsiteBattlegroundsComponent,
		canActivate: [AuthGuard],
	},
	{
		path: 'duels/hero',
		component: WebsiteDuelsHeroesComponent,
		canActivate: [AuthGuard],
	},
	{
		path: 'duels/hero-power',
		component: WebsiteDuelsHeroPowersComponent,
		canActivate: [AuthGuard],
	},
	{
		path: 'duels/signature-treasure',
		component: WebsiteDuelsSignatureTreasuresComponent,
		canActivate: [AuthGuard],
	},
	{
		path: 'duels',
		redirectTo: '/duels/hero',
		pathMatch: 'full',
	},
	{
		path: 'premium',
		component: WebsitePremiumComponent,
		canActivate: [PremiumRedirectGuard],
		pathMatch: 'prefix',
	},
	{
		path: 'owAuth',
		component: WebsiteAuthComponent,
		pathMatch: 'prefix',
	},
	{
		path: '',
		redirectTo: '/battlegrounds',
		pathMatch: 'prefix',
	},
	{
		path: '**',
		redirectTo: '/battlegrounds',
		pathMatch: 'prefix',
	},
];
