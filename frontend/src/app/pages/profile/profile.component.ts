import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';

interface ProfileData {
  username: string;
  email: string;
  createdAt: string;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  profile: ProfileData | null = null;
  loading = true;
  loadError = '';

  // change password flow
  changingPassword = false;
  step: 'idle' | 'otp-sent' = 'idle';
  newPassword = '';
  confirmPassword = '';
  otp = '';
  cpError = '';
  cpSuccess = '';

  constructor(private http: HttpClient, private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.http.get<ProfileData>(`${environment.apiUrl}/profile/me`).subscribe({
      next: (data) => {
        this.profile = data;
        this.loading = false;
      },
      error: (err) => {
        this.loadError = err?.error?.message || 'Failed to load profile';
        this.loading = false;
      },
    });
  }

  startChangePassword(): void {
    this.changingPassword = true;
    this.cpError = '';
    this.cpSuccess = '';
    this.step = 'idle';
  }

  requestOtp(): void {
    this.cpError = '';
    this.auth.requestChangePassword().subscribe({
      next: () => {
        this.step = 'otp-sent';
        this.cpSuccess = 'OTP sent to your email';
      },
      error: (err) => (this.cpError = err?.error?.message || 'Request failed'),
    });
  }

  confirmChangePassword(): void {
    this.cpError = '';
    this.cpSuccess = '';
    if (!this.otp || !this.newPassword) {
      this.cpError = 'Enter the OTP and a new password';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.cpError = 'Passwords do not match';
      return;
    }
    this.auth.changePassword(this.otp, this.newPassword).subscribe({
      next: () => {
        this.cpSuccess = 'Password changed successfully';
        this.changingPassword = false;
        this.step = 'idle';
        this.otp = '';
        this.newPassword = '';
        this.confirmPassword = '';
      },
      error: (err) => (this.cpError = err?.error?.message || 'Change password failed'),
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/signin']);
  }
}
