import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subject, combineLatest, of } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import * as L from 'leaflet';
import { AnalyticsService } from '../../core/services/analytics.service';
import { MapService, CountryLocation } from '../../core/services/map.service';
import { CountryBreakdown, SalaryAnalyticsSummary } from '../../core/models/analytics.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between p-3 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-4 md:space-y-6">
      <!-- Hero Header -->
      <div class="z-10 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Live Executive Compensation Dashboard
          </div>
          <h1 class="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            ACME Global Workforce & <br class="hidden md:inline" />
            <span class="bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent">
              Compensation Intelligence
            </span>
          </h1>
          <p class="mt-2 text-xs sm:text-sm md:text-base text-slate-400 max-w-2xl">
            Real-time global headcount analytics, regional CTC spend distribution, and enterprise salary benchmarks across 10 global regions.
          </p>
        </div>

        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-center md:justify-end gap-2.5 sm:gap-3">
          <a
            routerLink="/employees"
            class="group inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 hover:from-indigo-500 hover:to-sky-400 shadow-lg shadow-indigo-500/25 transition-all duration-300"
          >
            <span>Enter Employee Database</span>
            <i class="pi pi-arrow-right text-xs group-hover:translate-x-1 transition-transform"></i>
          </a>
          <a
            routerLink="/analytics"
            class="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-xs sm:text-sm text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 transition-all duration-200 backdrop-blur-md"
          >
            <i class="pi pi-chart-bar text-indigo-400"></i>
            <span>HR Analytics</span>
          </a>
        </div>
      </div>

      <!-- Glassmorphic Stat Overlay Cards -->
      <div class="z-10 grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div class="p-3.5 sm:p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-glass">
          <div class="flex items-center justify-between text-[11px] sm:text-xs font-semibold text-slate-400 mb-1">
            <span>Total Headcount</span>
            <i class="pi pi-users text-indigo-400"></i>
          </div>
          <div class="text-xl sm:text-2xl md:text-3xl font-extrabold text-white">
            {{ summary?.activeHeadcount | number }}
          </div>
          <div class="text-[9px] sm:text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <i class="pi pi-check-circle"></i> 100% Active Workforce
          </div>
        </div>

        <div class="p-3.5 sm:p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-glass">
          <div class="flex items-center justify-between text-[11px] sm:text-xs font-semibold text-slate-400 mb-1">
            <span>Total Global CTC</span>
            <i class="pi pi-dollar text-emerald-400"></i>
          </div>
          <div class="text-xl sm:text-2xl md:text-3xl font-extrabold text-white">
            \${{ (summary?.totalCompanyCost || 0) | number:'1.0-0' }}
          </div>
          <div class="text-[9px] sm:text-[10px] text-slate-400 mt-1">
            <span>Annual CTC Spend</span>
          </div>
        </div>

        <div class="p-3.5 sm:p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-glass">
          <div class="flex items-center justify-between text-[11px] sm:text-xs font-semibold text-slate-400 mb-1">
            <span>Global Avg Salary</span>
            <i class="pi pi-chart-line text-sky-400"></i>
          </div>
          <div class="text-xl sm:text-2xl md:text-3xl font-extrabold text-white">
            \${{ (summary?.globalAverageSalary || 0) | number:'1.0-0' }}
          </div>
          <div class="text-[9px] sm:text-[10px] text-slate-400 mt-1">
            <span>Base Compensation</span>
          </div>
        </div>

        <div class="p-3.5 sm:p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-glass">
          <div class="flex items-center justify-between text-[11px] sm:text-xs font-semibold text-slate-400 mb-1">
            <span>Median Salary</span>
            <i class="pi pi-sort-numeric-down text-amber-400"></i>
          </div>
          <div class="text-xl sm:text-2xl md:text-3xl font-extrabold text-white">
            \${{ (summary?.medianSalary || 0) | number:'1.0-0' }}
          </div>
          <div class="text-[9px] sm:text-[10px] text-amber-400/90 mt-1">
            <span>Balanced Distribution</span>
          </div>
        </div>
      </div>

      <!-- Leaflet Interactive World Map Canvas Container -->
      <div class="relative w-full h-[360px] sm:h-[480px] md:h-[540px] rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-800/80 shadow-2xl bg-slate-900/80">
        <div id="map" class="w-full h-full z-0"></div>

        <!-- Responsive Legend Overlay -->
        <div class="absolute bottom-3 left-3 right-3 sm:right-auto sm:bottom-4 sm:left-4 z-[500] px-3 py-2 rounded-xl bg-slate-950/90 border border-slate-800 text-[10px] sm:text-[11px] text-slate-300 backdrop-blur-md flex items-center justify-between sm:justify-start gap-3 shadow-lg">
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-sky-400"></span>
            <span>Active Region Marker</span>
          </div>
          <div class="flex items-center gap-1 text-slate-400">
            <i class="pi pi-info-circle text-xs text-indigo-400"></i>
            <span>Tap marker for CTC</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  summary: SalaryAnalyticsSummary | null = null;
  countryBreakdown: CountryBreakdown[] = [];
  private map!: L.Map;
  private markersLayerGroup: L.LayerGroup | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private analyticsService: AnalyticsService,
    private mapService: MapService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  @HostListener('window:resize')
  onResize(): void {
    if (this.map) {
      setTimeout(() => this.map.invalidateSize(), 200);
    }
  }

  ngOnInit(): void {
    combineLatest([
      this.analyticsService.getSummary().pipe(
        catchError(() => of({
          totalCompanyCost: 0,
          globalAverageSalary: 0,
          medianSalary: 0,
          activeHeadcount: 0
        }))
      ),
      this.analyticsService.getCountryBreakdown().pipe(
        catchError(() => of([]))
      )
    ]).pipe(takeUntil(this.destroy$))
    .subscribe(([sum, breakdown]) => {
      this.summary = sum;
      this.countryBreakdown = breakdown;
      this.cdr.markForCheck();
      if (this.map) {
        this.renderMapMarkers();
      }
    });
  }

  ngAfterViewInit(): void {
    this.initMap();
    if (this.countryBreakdown.length > 0) {
      this.renderMapMarkers();
    }
  }

  private initMap(): void {
    if (this.map) return;

    const isMobile = window.innerWidth < 640;

    this.map = L.map('map', {
      center: isMobile ? [20, 0] : [20, 0],
      zoom: isMobile ? 1 : 2,
      minZoom: 1,
      maxZoom: 6,
      zoomControl: true,
      scrollWheelZoom: true
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(this.map);

    setTimeout(() => this.map.invalidateSize(), 300);
  }

  private renderMapMarkers(): void {
    if (!this.map) return;

    if (this.markersLayerGroup) {
      this.markersLayerGroup.clearLayers();
    } else {
      this.markersLayerGroup = L.layerGroup().addTo(this.map);
    }

    const locations = this.mapService.getAllLocations();
    const breakdownMap = new Map<string, CountryBreakdown>();
    this.countryBreakdown.forEach(b => breakdownMap.set(b.countryCode.toUpperCase(), b));

    locations.forEach(loc => {
      const bData = breakdownMap.get(loc.code.toUpperCase());
      const headcount = bData ? bData.headcount : 0;
      const totalCtc = bData ? bData.totalCtcSpend : 0;

      if (headcount === 0) return;

      const htmlContent = `
        <div class="map-badge-callout">
          <span class="font-bold">${loc.name}</span>
          <span class="opacity-80">(${headcount.toLocaleString()})</span>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: htmlContent,
        iconSize: [120, 32],
        iconAnchor: [60, 32]
      });

      const marker = L.marker([loc.lat, loc.lng], { icon: customIcon });

      const popupContent = `
        <div class="p-3 min-w-[180px] text-slate-100 font-sans">
          <div class="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <span class="font-bold text-xs sm:text-sm text-indigo-300">${loc.name} (${loc.code})</span>
            <span class="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold">Active Region</span>
          </div>
          <div class="space-y-1.5 text-xs">
            <div class="flex justify-between">
              <span class="text-slate-400">Headcount:</span>
              <span class="font-semibold text-white">${headcount.toLocaleString()}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Total CTC:</span>
              <span class="font-semibold text-emerald-400">\$${totalCtc.toLocaleString()}</span>
            </div>
            ${bData ? `
            <div class="flex justify-between">
              <span class="text-slate-400">Avg Salary:</span>
              <span class="font-semibold text-sky-300">\$${Math.round(bData.averageBaseSalary).toLocaleString()}</span>
            </div>
            ` : ''}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        className: 'map-dialog-popup',
        closeButton: true
      });

      this.markersLayerGroup!.addLayer(marker);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.map) {
      this.map.remove();
    }
  }
}
