import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="register-container">
      <mat-card class="register-card">
        <mat-card-header>
          <mat-card-title>🤖 DocuMind AI</mat-card-title>
          <mat-card-subtitle>Create your account</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Full Name</mat-label>
              <input matInput type="text" formControlName="fullName" placeholder="John Doe">
              @if (registerForm.get('fullName')?.hasError('required') && registerForm.get('fullName')?.touched) {
                <mat-error>Full name is required</mat-error>
              }
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" placeholder="you@example.com">
              @if (registerForm.get('email')?.hasError('required') && registerForm.get('email')?.touched) {
                <mat-error>Email is required</mat-error>
              }
              @if (registerForm.get('email')?.hasError('email')) {
                <mat-error>Invalid email format</mat-error>
              }
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput type="password" formControlName="password" placeholder="Minimum 6 characters">
              @if (registerForm.get('password')?.hasError('required') && registerForm.get('password')?.touched) {
                <mat-error>Password is required</mat-error>
              }
              @if (registerForm.get('password')?.hasError('minlength')) {
                <mat-error>Password must be at least 6 characters</mat-error>
              }
            </mat-form-field>
            
            @if (errorMessage()) {
              <div class="error-message">{{ errorMessage() }}</div>
            }
            
            @if (successMessage()) {
              <div class="success-message">{{ successMessage() }}</div>
            }
            
            <button mat-raised-button color="primary" type="submit" 
                    [disabled]="registerForm.invalid || loading()" class="full-width">
              @if (loading()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                Create Account
              }
            </button>
          </form>
          
          <div class="login-link">
            Already have an account? <a routerLink="/login">Sign in here</a>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    .register-card {
      width: 100%;
      max-width: 400px;
      margin: 20px;
    }
    
    mat-card-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 20px;
    }
    
    mat-card-title {
      font-size: 28px;
      font-weight: bold;
    }
    
    .full-width {
      width: 100%;
      margin-bottom: 15px;
    }
    
    .error-message {
      color: #f44336;
      margin-bottom: 15px;
      padding: 10px;
      background: #ffebee;
      border-radius: 4px;
      text-align: center;
    }
    
    .success-message {
      color: #4caf50;
      margin-bottom: 15px;
      padding: 10px;
      background: #e8f5e9;
      border-radius: 4px;
      text-align: center;
    }
    
    .login-link {
      text-align: center;
      margin-top: 20px;
    }
    
    .login-link a {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
    }
    
    .login-link a:hover {
      text-decoration: underline;
    }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  
  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  
  registerForm: FormGroup = this.fb.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });
  
  onSubmit(): void {
    if (this.registerForm.valid) {
      this.loading.set(true);
      this.errorMessage.set('');
      this.successMessage.set('');
      
      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          this.loading.set(false);
          this.successMessage.set('Account created! Redirecting to login...');
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMessage.set(err.error?.message || 'Registration failed. Please try again.');
        }
      });
    }
  }
}