import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  resetFormData = '';
  constructor(private router: Router){}
  onSubmit(event : Event){
    event.preventDefault();
    const emailInput = document.getElementById('ForgotEmail') as HTMLInputElement | null;
    const email = emailInput?.value ?? '';
    if (emailInput && !emailInput.checkValidity()) {
      emailInput.reportValidity();
      return;
    }
    this.router.navigate(['/password-recovery'], { 
      state: { email } 
    });
  }
}