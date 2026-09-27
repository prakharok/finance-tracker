import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
})
export class ForgotPasswordComponent {
  step: 'request' | 'reset' = 'request';
  email = '';
  otp = '';
  newPassword = '';
  confirmPassword = '';
  error = '';
  success = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  requestOtp(): void {
    this.error = '';
    this.success = '';
    if (!this.email) {
      this.error = 'Enter your email';
      return;
    }
    this.loading = true;
    this.auth.forgotPassword(this.email).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'OTP sent to your email';
        this.step = 'reset';
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Request failed';
      },
    });
  }

  resetPassword(): void {
    this.error = '';
    this.success = '';
    if (!this.otp || !this.newPassword) {
      this.error = 'Enter the OTP and a new password';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }
    this.loading = true;
    this.auth.resetPassword(this.email, this.otp, this.newPassword).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Password reset! Redirecting to sign in...';
        setTimeout(() => this.router.navigate(['/signin']), 1200);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Reset failed';
      },
    });
  }
}
