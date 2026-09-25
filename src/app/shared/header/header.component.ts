import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="sticky top-0 z-[999] bg-slate-950/90 backdrop-blur-xl border-b border-slate-900 shadow-lg">
      <div class="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <!-- Logo -->
        <a routerLink="/" (click)="closeMobileMenu()" class="flex items-center gap-2.5 sm:gap-3 group">
          <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center text-white font-black text-base sm:text-lg shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
            A
          </div>
          <div>
            <div class="font-black text-xs sm:text-sm tracking-wider text-white flex items-center gap-1.5">
              <span>ACME ORG</span>
              <span class="text-[8px] sm:text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">HR PLATFORM</span>
            </div>
            <div class="text-[9px] sm:text-[10px] text-slate-400 font-medium">Salary & Compensation Intelligence</div>
          </div>
        </a>

        <!-- Desktop Navigation Links -->
        <nav class="hidden md:flex items-center gap-1 md:gap-2">
          <a
            routerLink="/"
            routerLinkActive="bg-slate-900 text-white font-bold border-indigo-500/40"
            [routerLinkActiveOptions]="{ exact: true }"
            class="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900/60 border border-transparent transition-all flex items-center gap-2"
          >
            <i class="pi pi-globe text-indigo-400"></i>
            <span>Global Map</span>
          </a>

          <a
            routerLink="/employees"
            routerLinkActive="bg-slate-900 text-white font-bold border-indigo-500/40"
            class="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900/60 border border-transparent transition-all flex items-center gap-2"
          >
            <i class="pi pi-users text-sky-400"></i>
            <span>Employee Directory</span>
          </a>

          <a
            routerLink="/analytics"
            routerLinkActive="bg-slate-900 text-white font-bold border-indigo-500/40"
            class="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900/60 border border-transparent transition-all flex items-center gap-2"
          >
            <i class="pi pi-chart-pie text-emerald-400"></i>
            <span>Analytics Dashboard</span>
          </a>
        </nav>

        <!-- Mobile Hamburger Toggle Button -->
        <button
          (click)="toggleMobileMenu()"
          aria-label="Toggle navigation menu"
          class="md:hidden p-2 rounded-xl text-slate-300 hover:text-white bg-slate-900/80 border border-slate-800 focus:outline-none"
        >
          <i class="pi" [ngClass]="isMobileMenuOpen ? 'pi-times' : 'pi-bars'" style="font-size: 1.25rem;"></i>
        </button>
      </div>

      <!-- Mobile Dropdown Drawer Menu -->
      <div
        *ngIf="isMobileMenuOpen"
        class="md:hidden border-b border-slate-900 bg-slate-950/95 backdrop-blur-2xl px-4 py-3 space-y-2 animate-in slide-in-from-top-2 duration-200"
      >
        <a
          routerLink="/"
          routerLinkActive="bg-slate-900 text-white font-bold border-indigo-500/40"
          [routerLinkActiveOptions]="{ exact: true }"
          (click)="closeMobileMenu()"
          class="w-full px-4 py-3 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent transition-all flex items-center gap-3"
        >
          <i class="pi pi-globe text-indigo-400 text-base"></i>
          <span>Global Map Dashboard</span>
        </a>

        <a
          routerLink="/employees"
          routerLinkActive="bg-slate-900 text-white font-bold border-indigo-500/40"
          (click)="closeMobileMenu()"
          class="w-full px-4 py-3 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent transition-all flex items-center gap-3"
        >
          <i class="pi pi-users text-sky-400 text-base"></i>
          <span>Employee Directory</span>
        </a>

        <a
          routerLink="/analytics"
          routerLinkActive="bg-slate-900 text-white font-bold border-indigo-500/40"
          (click)="closeMobileMenu()"
          class="w-full px-4 py-3 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent transition-all flex items-center gap-3"
        >
          <i class="pi pi-chart-pie text-emerald-400 text-base"></i>
          <span>Analytics Dashboard</span>
        </a>
      </div>
    </header>
  `
})
export class HeaderComponent {
  isMobileMenuOpen = false;

  constructor(private cdr: ChangeDetectorRef) {}

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    this.cdr.markForCheck();
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
    this.cdr.markForCheck();
  }
}
