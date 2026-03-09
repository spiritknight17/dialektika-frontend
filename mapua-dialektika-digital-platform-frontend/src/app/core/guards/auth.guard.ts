import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const user = this.authService.currentUser;

    if (!this.authService.isLoggedIn) {
      // Not logged in, redirect to login
      return this.router.createUrlTree([''], {
        queryParams: { returnUrl: state.url },
      });
    }

    const requiredRole = route.data['role'] as string | undefined;
    if (requiredRole && user?.role !== requiredRole) {
      // Logged in but not authorized
      return this.router.createUrlTree(['/dialektika-board']);
    }

    // Logged in & authorized
    return true;
  }
}
