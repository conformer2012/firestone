import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { AuthenticationService } from 'libs/website/core/src/lib/security/authentication.service';
import { Observable } from 'rxjs';

@Injectable()
export class PremiumRedirectGuard  {
	constructor(private auth: AuthenticationService, private router: Router) {}

	canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
		if (this.auth.isPremium()) {
			this.router.navigate(['/profile']);
			return true;
		}

		return true;
	}
}
