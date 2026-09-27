import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly base = `${environment.apiUrl}/auth`;
  private userSubject = new BehaviorSubject<AuthUser | null>(this.readStoredUser());
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {}

  private readStoredUser(): AuthUser | null {
    const raw = localStorage.getItem('ft_user');
    return raw ? JSON.parse(raw) : null;
  }

  get token(): string | null {
    return localStorage.getItem('ft_token');
  }

  get isLoggedIn(): boolean {
    return !!this.token;
  }

  signup(username: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.base}/signup`, { username, email, password });
  }

  verifyOtp(email: string, otp: string, purpose: 'signup' | 'reset' | 'change-password'): Observable<any> {
    return this.http.post(`${this.base}/verify-otp`, { email, otp, purpose });
  }

  signin(email: string, password: string): Observable<{ token: string; user: AuthUser }> {
    return this.http.post<{ token: string; user: AuthUser }>(`${this.base}/signin`, { email, password }).pipe(
      tap((res) => {
        localStorage.setItem('ft_token', res.token);
        localStorage.setItem('ft_user', JSON.stringify(res.user));
        this.userSubject.next(res.user);
      })
    );
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.base}/forgot-password`, { email });
  }

  resetPassword(email: string, otp: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.base}/reset-password`, { email, otp, newPassword });
  }

  requestChangePassword(): Observable<any> {
    return this.http.post(`${this.base}/request-change-password`, {});
  }

  changePassword(otp: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.base}/change-password`, { otp, newPassword });
  }

  logout(): void {
    localStorage.removeItem('ft_token');
    localStorage.removeItem('ft_user');
    this.userSubject.next(null);
  }
}
