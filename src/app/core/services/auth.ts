import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  fullName: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  // Signals for reactive state
  currentUser = signal<string | null>(null);
  isAuthenticated = signal<boolean>(false);
  
  constructor() {
    // Check if user is already logged in
    const token = this.getToken();
    if (token) {
      const user = localStorage.getItem('user');
      this.currentUser.set(user);
      this.isAuthenticated.set(true);
    }
  }
  
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', response.email);
          localStorage.setItem('fullName', response.fullName);
          this.currentUser.set(response.email);
          this.isAuthenticated.set(true);
        })
      );
  }
  
  register(data: SignupRequest): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/signup`, data);
  }
  
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('fullName');
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }
  
  getToken(): string | null {
    return localStorage.getItem('token');
  }
  
  getUser(): string | null {
    return localStorage.getItem('user');
  }
  
  getFullName(): string | null {
    return localStorage.getItem('fullName');
  }
}