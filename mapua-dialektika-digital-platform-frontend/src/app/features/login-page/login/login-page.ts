import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthService, PublicUser } from '../../../core/services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-page.html',
  styleUrls: ['./login-page.css'],
})
export class LoginPage implements OnInit {
  http = inject(HttpClient);
  router = inject(Router);
  authService = inject(AuthService);
  loading = signal(false);
  error = signal<string | null>(null);
  route = inject(ActivatedRoute);

  loginObj: any = {
    username: 'Derven',
    password: 'admin123',
  };

  returnUrl = '/dialektika-board';

  onLogin(event?: Event) {
    if (event) event.preventDefault();

    this.error.set(null);
    this.loading.set(true);

    const body = new HttpParams()
      .set('username', this.loginObj.username)
      .set('password', this.loginObj.password)
      .set('grant_type', 'password');

    // Login request
    this.http
      .post<any>(`${environment.apiUrl}/rest/login`, body.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      .subscribe({
        next: (res) => {
          this.loading.set(false);

          this.authService.setTokens(res.access_token, res.refresh_token);

          // Fetch user info
          this.http.get<PublicUser>(`${environment.apiUrl}/rest/user`).subscribe({
            next: (user) => {
              this.authService.setPublicUser(user); // store it in service + localStorage

              // Navigate to dashboard after storing user info
              this.router.navigateByUrl(this.returnUrl);
            },
            error: (err) => {
              console.error('Failed to fetch user info', err);
              // optionally continue even if user info fails
              this.router.navigateByUrl(this.returnUrl);
            },
          });
          // Navigate to dashboard
          this.router.navigateByUrl(this.returnUrl);
        },
        error: (err) => {
          this.loading.set(false);

          console.error('Login Failed!', err);
          if (err.status === 401) {
            this.error.set('Invalid Credentials!');
          } else {
            this.error.set('Login failed. Please try again.');
          }
        },
      });
  }

  ngOnInit() {
    const url = this.route.snapshot.queryParamMap.get('returnUrl');
    if (url) {
      this.returnUrl = url;
    }

    if (this.authService.isLoggedIn) {
      this.router.navigateByUrl('/dialektika-board');
    }
  }
}
