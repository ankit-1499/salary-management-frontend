import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, ViewChildren, QueryList, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, combineLatest, of } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { NgChartsModule, BaseChartDirective } from 'ng2-charts';
import { ChartOptions, ChartType, ChartData, Chart, registerables } from 'chart.js';
import { AnalyticsService } from '../../core/services/analytics.service';
import { CountryBreakdown, DepartmentBreakdown, SalaryAnalyticsSummary, TopEarner } from '../../core/models/analytics.model';

Chart.register(...registerables);

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NgChartsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-7xl mx-auto p-3 sm:p-6 md:p-8 space-y-6 md:space-y-8">
      <!-- Header Banner -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-800/80 backdrop-blur-xl shadow-glass">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
            <i class="pi pi-chart-pie text-xs"></i>
            HR Executive Intelligence
          </div>
          <h1 class="text-xl sm:text-2xl md:text-3xl font-extrabold text-white">Salary Distribution & Regional Spend</h1>
          <p class="text-xs sm:text-sm text-slate-400 mt-1">
            Departmental cost structures, global salary averages, and top earner leaderboards.
          </p>
        </div>

        <div class="flex items-center gap-3 text-xs text-slate-400">
          <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <i class="pi pi-clock text-indigo-400"></i>
            Sub-50ms Execution
          </span>
        </div>
      </div>

      <!-- Executive Stat Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div class="p-3.5 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-glass">
          <div class="text-[11px] sm:text-xs font-semibold text-slate-400 mb-1">Total CTC Budget</div>
          <div class="text-xl sm:text-2xl md:text-3xl font-extrabold text-white">
            \${{ (summary?.totalCompanyCost || 0) | number:'1.0-0' }}
          </div>
          <div class="text-[9px] sm:text-[10px] text-emerald-400 mt-1">Global Spend Pool</div>
        </div>

        <div class="p-3.5 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-glass">
          <div class="text-[11px] sm:text-xs font-semibold text-slate-400 mb-1">Global Avg Base Pay</div>
          <div class="text-xl sm:text-2xl md:text-3xl font-extrabold text-sky-300">
            \${{ (summary?.globalAverageSalary || 0) | number:'1.0-0' }}
          </div>
          <div class="text-[9px] sm:text-[10px] text-sky-400 mt-1">Base Salary Mean</div>
        </div>

        <div class="p-3.5 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-glass">
          <div class="text-[11px] sm:text-xs font-semibold text-slate-400 mb-1">Global Median Salary</div>
          <div class="text-xl sm:text-2xl md:text-3xl font-extrabold text-amber-300">
            \${{ (summary?.medianSalary || 0) | number:'1.0-0' }}
          </div>
          <div class="text-[9px] sm:text-[10px] text-amber-400 mt-1">Midpoint Benchmark</div>
        </div>

        <div class="p-3.5 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-glass">
          <div class="text-[11px] sm:text-xs font-semibold text-slate-400 mb-1">Active Headcount</div>
          <div class="text-xl sm:text-2xl md:text-3xl font-extrabold text-indigo-400">
            {{ (summary?.activeHeadcount || 0) | number }}
          </div>
          <div class="text-[9px] sm:text-[10px] text-indigo-300 mt-1">Across 10 Regions</div>
        </div>
      </div>

      <!-- Responsive Charts Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <!-- Department CTC Spend Bar Chart -->
        <div class="bg-slate-900/60 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-800/80 backdrop-blur-xl shadow-glass flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="font-bold text-sm sm:text-base text-white">Department CTC Spend</h3>
                <p class="text-xs text-slate-400">Total compensation expenditure by department</p>
              </div>
              <i class="pi pi-chart-bar text-indigo-400 text-lg"></i>
            </div>
            <div class="relative h-[250px] sm:h-[300px]">
              <canvas
                baseChart
                [data]="deptChartData"
                [options]="barChartOptions"
                [type]="'bar'"
              ></canvas>
            </div>
          </div>
        </div>

        <!-- Regional CTC Spend Doughnut Chart -->
        <div class="bg-slate-900/60 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-800/80 backdrop-blur-xl shadow-glass flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="font-bold text-sm sm:text-base text-white">Country Spend Distribution</h3>
                <p class="text-xs text-slate-400">Share of total CTC spend per country</p>
              </div>
              <i class="pi pi-chart-pie text-emerald-400 text-lg"></i>
            </div>
            <div class="relative h-[250px] sm:h-[300px]">
              <canvas
                baseChart
                [data]="countryChartData"
                [options]="doughnutChartOptions"
                [type]="'doughnut'"
              ></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Earners Leaderboard -->
      <div class="bg-slate-900/60 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-800/80 backdrop-blur-xl shadow-glass space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 class="font-bold text-base sm:text-lg text-white flex items-center gap-2">
              <i class="pi pi-crown text-amber-400"></i>
              Top Compensated Employees
            </h3>
            <p class="text-xs text-slate-400">Highest earners globally or filtered by region</p>
          </div>

          <div class="flex items-center gap-2.5">
            <label class="text-xs text-slate-400 whitespace-nowrap">Filter Region:</label>
            <select
              [ngModel]="selectedCountryLeaderboard"
              (ngModelChange)="onCountryLeaderboardChange($event)"
              class="w-full sm:w-auto px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">Global (All Regions)</option>
              <option value="USA">USA</option>
              <option value="CAN">Canada</option>
              <option value="GBR">United Kingdom</option>
              <option value="DEU">Germany</option>
              <option value="FRA">France</option>
              <option value="IND">India</option>
              <option value="AUS">Australia</option>
              <option value="JPN">Japan</option>
              <option value="SGP">Singapore</option>
              <option value="BRA">Brazil</option>
            </select>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse min-w-[600px]">
            <thead>
              <tr class="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                <th class="py-3 px-3 sm:px-4">Rank</th>
                <th class="py-3 px-3 sm:px-4">ID</th>
                <th class="py-3 px-3 sm:px-4">Name</th>
                <th class="py-3 px-3 sm:px-4">Department</th>
                <th class="py-3 px-3 sm:px-4">Country</th>
                <th class="py-3 px-3 sm:px-4 text-right">Base Pay</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              <tr *ngFor="let earner of topEarners; let idx = index" class="hover:bg-slate-800/40 transition-colors">
                <td class="py-3 px-3 sm:px-4 font-extrabold text-amber-400">
                  #{{ idx + 1 }}
                </td>
                <td class="py-3 px-3 sm:px-4 font-mono font-semibold text-indigo-400">
                  #{{ earner.id }}
                </td>
                <td class="py-3 px-3 sm:px-4 font-bold text-white">
                  {{ earner.firstName }} {{ earner.lastName }}
                </td>
                <td class="py-3 px-3 sm:px-4 text-slate-300">
                  {{ earner.departmentName }}
                </td>
                <td class="py-3 px-3 sm:px-4">
                  <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                    {{ earner.countryCode }}
                  </span>
                </td>
                <td class="py-3 px-3 sm:px-4 text-right font-bold text-emerald-400">
                  \${{ earner.basePay | number:'1.2-2' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class AnalyticsDashboardComponent implements OnInit, OnDestroy {
  summary: SalaryAnalyticsSummary | null = null;
  deptBreakdown: DepartmentBreakdown[] = [];
  countryBreakdown: CountryBreakdown[] = [];
  topEarners: TopEarner[] = [];
  selectedCountryLeaderboard = '';

  @ViewChildren(BaseChartDirective) charts?: QueryList<BaseChartDirective>;

  barChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
      y: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { color: 'rgba(255, 255, 255, 0.05)' } }
    }
  };

  deptChartData: ChartData<'bar'> = {
    labels: ['Engineering', 'HR', 'Finance', 'Marketing', 'Sales'],
    datasets: [{
      data: [450000000, 120000000, 180000000, 150000000, 200000000],
      backgroundColor: ['#6366f1', '#10b981', '#3b82f6', '#f59e0b', '#ec4899'],
      borderRadius: 8
    }]
  };

  doughnutChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: window.innerWidth < 640 ? 'bottom' : 'right',
        labels: { color: '#cbd5e1', font: { size: 10 } }
      }
    }
  };

  countryChartData: ChartData<'doughnut'> = {
    labels: ['USA', 'CAN', 'GBR', 'DEU', 'IND', 'OTHERS'],
    datasets: [{
      data: [35, 15, 15, 12, 13, 10],
      backgroundColor: ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#64748b']
    }]
  };

  private destroy$ = new Subject<void>();

  constructor(
    private analyticsService: AnalyticsService,
    private cdr: ChangeDetectorRef
  ) {}

  @HostListener('window:resize')
  onResize(): void {
    if (this.doughnutChartOptions.plugins?.legend) {
      this.doughnutChartOptions.plugins.legend.position = window.innerWidth < 640 ? 'bottom' : 'right';
      this.charts?.forEach(chart => chart.update());
    }
  }

  ngOnInit(): void {
    combineLatest([
      this.analyticsService.getSummary().pipe(catchError(() => of(null))),
      this.analyticsService.getDepartmentBreakdown().pipe(catchError(() => of([]))),
      this.analyticsService.getCountryBreakdown().pipe(catchError(() => of([]))),
      this.analyticsService.getTopEarners('', 10).pipe(catchError(() => of([])))
    ]).pipe(takeUntil(this.destroy$))
    .subscribe(([summary, deptList, countryList, earners]) => {
      if (summary) this.summary = summary;
      if (deptList.length > 0) {
        this.deptBreakdown = deptList;
        this.updateDeptChart(deptList);
      }
      if (countryList.length > 0) {
        this.countryBreakdown = countryList;
        this.updateCountryChart(countryList);
      }
      if (earners.length > 0) {
        this.topEarners = earners;
      }
      this.cdr.markForCheck();
      setTimeout(() => {
        this.charts?.forEach(chart => chart.update());
      }, 0);
    });
  }

  onCountryLeaderboardChange(countryCode: string): void {
    this.selectedCountryLeaderboard = countryCode;
    this.analyticsService.getTopEarners(countryCode, 10).pipe(
      catchError(() => of([])),
      takeUntil(this.destroy$)
    ).subscribe(earners => {
      this.topEarners = earners;
      this.cdr.markForCheck();
    });
  }

  private updateDeptChart(deptList: DepartmentBreakdown[]): void {
    this.deptChartData = {
      labels: deptList.map(d => d.departmentName || d.departmentCode),
      datasets: [{
        data: deptList.map(d => d.totalCtcSpend),
        backgroundColor: ['#6366f1', '#10b981', '#3b82f6', '#f59e0b', '#ec4899'],
        borderRadius: 8
      }]
    };
  }

  private updateCountryChart(countryList: CountryBreakdown[]): void {
    this.countryChartData = {
      labels: countryList.map(c => c.countryCode),
      datasets: [{
        data: countryList.map(c => c.totalCtcSpend),
        backgroundColor: ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#3b82f6', '#14b8a6', '#f97316', '#64748b']
      }]
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
