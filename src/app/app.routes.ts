import { Routes } from '@angular/router';
import { RegisterComponent } from './features/auth/register/register';
import { authGuard } from './core/guards/auth-guard';
import { DocumentDetailComponent } from './features/documents/document-detail';
import { LoginComponent } from './features/auth/login/login';
import { DashboardComponent } from './features/dashboard/dashboard';


export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'document/:id', 
    component: DocumentDetailComponent,
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '/login' }
];