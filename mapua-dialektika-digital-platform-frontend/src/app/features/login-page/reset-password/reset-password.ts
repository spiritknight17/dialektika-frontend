import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword {
  error = signal<string | null>(null);
  resetPasswordFormData = '';
  constructor(private router: Router){};
  onSubmit(event : Event){
    event.preventDefault();
    const newPassword = document.getElementById('NewPassword') as HTMLInputElement | null;
    const confirmPassword = document.getElementById('ConfirmPassword') as HTMLInputElement | null;
    const newpassword = newPassword?.value ?? '';
    const confirmpassword = confirmPassword?.value ?? '';
    if (newPassword && !newPassword.checkValidity() && confirmPassword && !confirmPassword.checkValidity()){
      newPassword.reportValidity();
      confirmPassword.reportValidity();
      return;
    }
    this.router.navigate(['/password-reset-successful'], {
      state: { newpassword, confirmpassword }
    });
  }
}
