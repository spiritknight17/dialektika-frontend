import { inject, Injector, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { isPlatformBrowser } from '@angular/common';
import {
  BehaviorSubject,
  filter,
  switchMap,
  take,
  throwError,
  of,
  finalize,
  catchError,
} from 'rxjs';
import { environment } from '../environments/environment';

let refreshingInProgress = false;
const refreshSubject = new BehaviorSubject<string | null>(null);

const authInterceptor: HttpInterceptorFn = (req, next) => {
  const injector = inject(Injector);

  return (() => {
    const authService = injector.get(AuthService);
    const router = injector.get(Router);
    const http = injector.get(HttpClient);
    const platformId = injector.get(PLATFORM_ID);

    // Skip login & refresh endpoints
    if (req.url.endsWith('/rest/login') || req.url.endsWith('/rest/refresh')) {
      return next(req);
    }

    // Attach access token
    const token = authService.currentAccessToken;
    const clonedReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

    return next(clonedReq).pipe(
      // Catch 401 errors
      switchMap((event) => of(event)),
      catchError((err: any) => {
        if (err.status !== 401) return throwError(() => err);

        const refreshToken = authService.currentRefreshToken;

        // No refresh token? logout
        if (!refreshToken) {
          authService.clearTokens();
          if (isPlatformBrowser(platformId)) {
            router.navigate([''], { queryParams: { returnUrl: window.location.pathname } });
          }
          return throwError(() => err);
        }

        // If a refresh is already in progress, queue this request
        if (refreshingInProgress) {
          return refreshSubject.pipe(
            filter((t) => t != null),
            take(1),
            switchMap((newToken) =>
              next(req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } })),
            ),
          );
        }

        // Start refresh
        refreshingInProgress = true;
        refreshSubject.next(null);

        return http
          .post<any>(`${environment.apiUrl}/rest/refresh`, { refresh_token: refreshToken })
          .pipe(
            switchMap((res) => {
              // Update AuthService with new tokens
              authService.setTokens(res.access_token, res.refresh_token);
              refreshSubject.next(res.access_token);

              // Retry original request
              return next(
                req.clone({ setHeaders: { Authorization: `Bearer ${res.access_token}` } }),
              );
            }),
            catchError((e) => {
              // Refresh failed -> logout
              authService.clearTokens();
              if (isPlatformBrowser(platformId)) {
                router.navigate([''], { queryParams: { returnUrl: window.location.pathname } });
              }
              return throwError(() => e);
            }),
            finalize(() => {
              refreshingInProgress = false;
            }),
          );
      }),
    );
  })();
};

export { authInterceptor };
