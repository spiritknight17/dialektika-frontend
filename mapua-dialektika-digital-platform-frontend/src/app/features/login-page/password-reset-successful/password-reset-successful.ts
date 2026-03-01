import { Component, inject } from '@angular/core';
import { RouterLink, Router } from "@angular/router";

@Component({
  selector: 'app-password-reset-successful',
  imports: [],
  templateUrl: './password-reset-successful.html',
  styleUrl: './password-reset-successful.css',
})
export class PasswordResetSuccessful {
  private readonly router = inject(Router);
  backToLogin(){
    this.router.navigate(['/'])
  }

}
