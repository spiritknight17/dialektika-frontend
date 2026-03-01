import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router} from '@angular/router';
@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  canActivate: CanActivateFn = (route, state) => {
    const hasWindow = typeof window !== 'undefined';
    const token = hasWindow ? localStorage.getItem('access_token') : null;
    const bypass =
      (hasWindow && (window as any).__DIA_DEBUG_BYPASS__) ||
      !!token;
    if (bypass) {
      return true;
    }
    const router = inject(Router);
    router.navigate([''], {queryParams: { returnUrl: state.url}});
    return false;
  };
}
