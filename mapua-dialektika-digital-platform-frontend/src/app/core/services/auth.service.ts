import { Injectable, signal, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
export interface PublicUser {
  username: string;
  email: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private platformId = inject(PLATFORM_ID);

  accessToken = signal<string | null>(null);
  refreshToken = signal<string | null>(null);
  publicUser = signal<PublicUser | null>(null); // <-- store user info

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.accessToken.set(localStorage.getItem('access_token'));
      this.refreshToken.set(localStorage.getItem('refresh_token'));

      const userStr = localStorage.getItem('public_user');
      if (userStr) {
        this.publicUser.set(JSON.parse(userStr));
      }
    }
  }

  setTokens(access: string, refresh: string) {
    this.accessToken.set(access);
    this.refreshToken.set(refresh);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
    }
  }

  setPublicUser(user: PublicUser) {
    this.publicUser.set(user);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('public_user', JSON.stringify(user));
    }
  }

  clearTokens() {
    this.accessToken.set(null);
    this.refreshToken.set(null);
    this.publicUser.set(null);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('public_user');
    }
  }

  get currentAccessToken(): string | null {
    return this.accessToken();
  }

  get currentRefreshToken(): string | null {
    return this.refreshToken();
  }

  get isLoggedIn(): boolean {
    return !!this.accessToken();
  }

  get currentUser(): PublicUser | null {
    return this.publicUser();
  }
}
