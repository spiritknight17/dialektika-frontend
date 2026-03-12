import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { trigger, style, transition, animate } from '@angular/animations';


@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  animations: [
    trigger('dropdownAnimation', [
      transition('closed => open', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition('open => closed', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' })),
      ]),
    ]),
    trigger('listAnimation', [
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateX(30px)' })),
      ]),
    ]),
  ],
})
export class HeaderComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  // Reactive user info
  user = this.authService.publicUser;

  // Computed initials
  userInitials = computed(() => {
    const user = this.user();
    if (!user) return '';
    // Take first two letters of username
    return user.username.slice(0, 2).toUpperCase();
  });

  // Computed: only admin sees the admin link
  isAdmin = computed(() => this.user()?.role === 'admin');

  private getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }

  showDropdown = false;
  confirmLogout = false;

  animationInProgress = false;

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
    this.confirmLogout = false;
    this.animationInProgress = true; // allow display during animation
  }

  onAnimationDone(event: any) {
    // When closing animation finishes, hide completely
    if (event.toState === 'closed') {
      this.animationInProgress = false;
    }
  }

  askLogoutConfirmation() {
    this.confirmLogout = true;
  }

  cancelLogout() {
    this.confirmLogout = false;
  }

  signOut() {
    this.confirmLogout = false;
    this.showDropdown = false;
    this.authService.clearTokens();
    this.router.navigate(['/']);
  }
}
