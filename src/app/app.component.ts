import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent],
  template: `
    <div class="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <app-header></app-header>
      <main class="flex-1">
        <router-outlet></router-outlet>
      </main>
      <footer class="py-6 border-t border-slate-900 bg-slate-950/80 backdrop-blur-md text-center text-xs text-slate-500">
        <div class="max-w-7xl mx-auto px-4">
          ACME Organization &copy; {{ currentYear }} Salary Management Platform. All Rights Reserved.
        </div>
      </footer>
    </div>
  `
})
export class AppComponent {
  currentYear = new Date().getFullYear();
}
