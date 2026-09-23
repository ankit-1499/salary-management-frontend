import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
    title: 'ACME Compensation Intelligence - Home'
  },
  {
    path: 'employees',
    loadComponent: () => import('./features/employee-directory/employee-directory.component').then(m => m.EmployeeDirectoryComponent),
    title: 'ACME Salary Management - Employee Directory'
  },
  {
    path: 'analytics',
    loadComponent: () => import('./features/analytics/analytics-dashboard.component').then(m => m.AnalyticsDashboardComponent),
    title: 'ACME HR Analytics Dashboard'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
