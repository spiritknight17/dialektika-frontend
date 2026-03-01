import { ApplicationConfig, provideBrowserGlobalErrorListeners, inject } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors, HttpInterceptorFn } from '@angular/common/http';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { catchError, throwError } from 'rxjs';
const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('access_token');
  const cloned = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
  return next(cloned).pipe(catchError((err) => {
    if (err.status === 401 || err.status === 403) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      const router = inject(Router);
      const path = typeof window !== 'undefined' ? window.location.pathname: '/';
      router.navigate([''], {queryParams: {returnUrl: path}});
    }
    return throwError(() => err);
  }));
}
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    provideClientHydration(),
    provideAnimations(),
    provideToastr({
      positionClass: 'toast-top-center', // <-- middle top
      timeOut: 3000,
      closeButton: true, // optional
    }),
  ],
};
