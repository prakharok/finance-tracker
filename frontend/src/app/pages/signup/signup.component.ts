import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent {
  step: 'form' | 'otp' = 'form';
  username = '';
  email = '';
  password = '';
  otp = '';
  error = '';
  success = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  submitSignup(): void {
    this.error = '';
    this.success = '';
    if (!this.username || !this.email || !this.password) {
      this.error = 'All fields are required';
      return;
    }
    this.loading = true;
    this.auth.signup(this.username, this.email, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'OTP sent to your email';
        this.step = 'otp';
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Signup failed';
      },
    });
  }

  submitOtp(): void {
    this.error = '';
    this.success = '';
    if (!this.otp) {
      this.error = 'Enter the OTP sent to your email';
      return;
    }
    this.loading = true;
    this.auth.verifyOtp(this.email, this.otp, 'signup').subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Email verified! You can now sign in.';
        setTimeout(() => this.router.navigate(['/signin']), 1200);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'OTP verification failed';
      },
    });
  }
}
