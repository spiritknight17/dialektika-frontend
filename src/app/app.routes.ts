import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { LoginPage } from './features/login-page/login/login-page';
import { DialektikaBoard } from './features/dialektika-board/dialektika-board';
import { AdminPage } from './features/admin-page/admin-page';
import { ForgotPassword } from './features/login-page/forgot-password/forgot-password';
import { PasswordRecovery } from './features/login-page/password-recovery/password-recovery';
import { ResetPassword } from './features/login-page/reset-password/reset-password';
import { PasswordResetSuccessful } from './features/login-page/password-reset-successful/password-reset-successful';

export const routes: Routes = [
  // Auth
  { path: '', component: LoginPage },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'password-recovery', component: PasswordRecovery },
  { path: 'reset-password', component: ResetPassword },
  { path: 'password-reset-successful', component: PasswordResetSuccessful },

  // Main app
  { path: 'dialektika-board', component: DialektikaBoard, canActivate: [AuthGuard] },

  // Admin only
  {
    path: 'admin',
    component: AdminPage,
    canActivate: [AuthGuard],
    data: { role: 'admin' }, // <-- only admin can access
  },
];