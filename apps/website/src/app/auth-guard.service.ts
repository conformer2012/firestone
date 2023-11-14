import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { AuthenticationService } from 'libs/website/core/src/lib/security/authentication.service';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard  {
	constructor(private auth: AuthenticationService, private router: Router) {}

	canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
		if (this.auth.isPremium()) {
			// This is the injected auth service which depends on what you are using
			return true;
		}

		this.router.navigate(['/premium']);
		return false;
	}
}
