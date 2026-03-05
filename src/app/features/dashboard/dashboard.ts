import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <mat-toolbar color="primary">
      <span>🤖 DocuMind AI</span>
      <span class="spacer"></span>
      <span>Welcome, {{ authService.getFullName() }}!</span>
      <button mat-button (click)="logout()">
        <mat-icon>logout</mat-icon>
        Logout
      </button>
    </mat-toolbar>
    
    <div class="dashboard-content">
      <h1>Dashboard</h1>
      <p>Backend connected successfully! 🎉</p>
      <p>User: {{ authService.getUser() }}</p>
      
      <div class="info-box">
        <h2>✅ Day 4 Complete!</h2>
        <p>Authentication working!</p>
        <p>Tomorrow: Document upload & AI features UI</p>
      </div>
    </div>
  `,
  styles: [`
    .spacer {
      flex: 1 1 auto;
    }
    
    .dashboard-content {
      padding: 40px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
  h1 {
  color: var(--mat-sys-primary);
  margin-bottom: 20px;
   }
    
    .info-box {
      background: #f5f5f5;
      padding: 30px;
      border-radius: 8px;
      margin-top: 30px;
      text-align: center;
    }
    
    .info-box h2 {
      color: #4caf50;
      margin-bottom: 15px;
    }
  `]
})
export class DashboardComponent {
  authService = inject(AuthService);
  
  logout(): void {
    this.authService.logout();
  }
}