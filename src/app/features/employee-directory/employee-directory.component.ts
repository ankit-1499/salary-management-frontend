import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject, BehaviorSubject, combineLatest, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, takeUntil, tap } from 'rxjs/operators';
import { EmployeeService } from '../../core/services/employee.service';
import { SeederService } from '../../core/services/seeder.service';
import { Employee, SalaryUpdate } from '../../core/models/employee.model';
import { PageResponse } from '../../core/models/page-response.model';

@Component({
  selector: 'app-employee-directory',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
      <!-- Header Banner & Seeder -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-3xl border border-slate-800/80 backdrop-blur-xl shadow-glass">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold mb-2">
            <i class="pi pi-database text-xs"></i>
            Enterprise Database Engine
          </div>
          <h1 class="text-2xl md:text-3xl font-extrabold text-white">Employee Salary Directory</h1>
          <p class="text-sm text-slate-400 mt-1">
            Search, filter, and manage compensation profiles across 10,000 organization records.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <button
            (click)="triggerSeeder()"
            [disabled]="isSeeding"
            class="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20"
          >
            <i class="pi" [ngClass]="isSeeding ? 'pi-spin pi-spinner' : 'pi-bolt'"></i>
            <span>{{ isSeeding ? 'Seeding 10k Records...' : 'Seed 10,000 Data Set' }}</span>
          </button>
        </div>
      </div>

      <!-- Filter & Search Toolbar -->
      <div class="bg-slate-900/40 p-4 rounded-2xl border border-slate-800/80 backdrop-blur-md grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- RxJS Debounced Search -->
        <div class="relative md:col-span-1">
          <i class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
          <input
            type="text"
            [ngModel]="searchQuery"
            (ngModelChange)="onSearchInput($event)"
            placeholder="Search by name, email, code..."
            class="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <!-- Department Filter -->
        <div>
          <select
            [ngModel]="selectedDepartmentId"
            (ngModelChange)="onDepartmentChange($event)"
            class="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors"
          >
            <option [ngValue]="null">All Departments</option>
            <option [ngValue]="1">Engineering (ENG)</option>
            <option [ngValue]="2">Human Resources (HR)</option>
            <option [ngValue]="3">Finance (FIN)</option>
            <option [ngValue]="4">Marketing (MKT)</option>
            <option [ngValue]="5">Sales (SLS)</option>
          </select>
        </div>

        <!-- Country Filter -->
        <div>
          <select
            [ngModel]="selectedCountryCode"
            (ngModelChange)="onCountryChange($event)"
            class="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors"
          >
            <option [ngValue]="null">All Countries</option>
            <option value="USA">USA (United States)</option>
            <option value="CAN">CAN (Canada)</option>
            <option value="GBR">GBR (United Kingdom)</option>
            <option value="DEU">DEU (Germany)</option>
            <option value="FRA">FRA (France)</option>
            <option value="IND">IND (India)</option>
            <option value="AUS">AUS (Australia)</option>
            <option value="JPN">JPN (Japan)</option>
            <option value="SGP">SGP (Singapore)</option>
            <option value="BRA">BRA (Brazil)</option>
          </select>
        </div>

        <!-- Status Filter -->
        <div>
          <select
            [ngModel]="selectedStatus"
            (ngModelChange)="onStatusChange($event)"
            class="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors"
          >
            <option [ngValue]="null">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="TERMINATED">Terminated</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      <!-- Data Table -->
      <div class="bg-slate-900/60 rounded-2xl border border-slate-800/80 overflow-hidden shadow-2xl backdrop-blur-xl">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th class="py-3.5 px-4">Emp Code</th>
                <th class="py-3.5 px-4">Employee Name</th>
                <th class="py-3.5 px-4">Department</th>
                <th class="py-3.5 px-4">Position</th>
                <th class="py-3.5 px-4">Country</th>
                <th class="py-3.5 px-4">Status</th>
                <th class="py-3.5 px-4 text-right">Base Pay</th>
                <th class="py-3.5 px-4 text-right">Total CTC</th>
                <th class="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 text-xs">
              <tr *ngIf="isLoading" class="animate-pulse">
                <td colspan="9" class="py-12 text-center text-slate-400">
                  <i class="pi pi-spin pi-spinner text-2xl text-indigo-400 mb-2 block"></i>
                  Loading employee records...
                </td>
              </tr>

              <tr *ngIf="!isLoading && pageData?.content?.length === 0">
                <td colspan="9" class="py-12 text-center text-slate-400">
                  <i class="pi pi-folder-open text-3xl text-slate-600 mb-2 block"></i>
                  No employees found matching criteria. Click "Seed 10,000 Data Set" to generate records.
                </td>
              </tr>

              <tr *ngFor="let emp of pageData?.content" class="hover:bg-slate-800/40 transition-colors">
                <td class="py-3.5 px-4 font-mono font-semibold text-indigo-400">
                  {{ emp.empCode }}
                </td>
                <td class="py-3.5 px-4">
                  <div class="font-bold text-white">{{ emp.firstName }} {{ emp.lastName }}</div>
                  <div class="text-[10px] text-slate-400">{{ emp.email }}</div>
                </td>
                <td class="py-3.5 px-4">
                  <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                    {{ emp.departmentName || emp.departmentCode || 'Engineering' }}
                  </span>
                </td>
                <td class="py-3.5 px-4 text-slate-300">
                  {{ emp.jobTitle || 'Specialist' }}
                </td>
                <td class="py-3.5 px-4 font-medium text-slate-300">
                  {{ emp.countryCode }}
                </td>
                <td class="py-3.5 px-4">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    [ngClass]="emp.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'">
                    {{ emp.status }}
                  </span>
                </td>
                <td class="py-3.5 px-4 text-right font-medium text-slate-200">
                  \${{ (emp.compensation?.basePay || 0) | number:'1.2-2' }}
                </td>
                <td class="py-3.5 px-4 text-right font-bold text-emerald-400">
                  \${{ (emp.compensation?.totalCompanyCost || emp.compensation?.basePay || 0) | number:'1.2-2' }}
                </td>
                <td class="py-3.5 px-4 text-center">
                  <button
                    (click)="openEmployeeModal(emp)"
                    class="px-2.5 py-1 rounded-lg text-[11px] font-medium text-indigo-300 hover:text-white bg-indigo-500/10 hover:bg-indigo-600 transition-all border border-indigo-500/20"
                  >
                    View / Edit
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Server-side Pagination Bar -->
        <div class="p-4 bg-slate-950/80 border-t border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            Showing <span class="font-bold text-white">{{ getStartIndex() }}</span> to
            <span class="font-bold text-white">{{ getEndIndex() }}</span> of
            <span class="font-bold text-white">{{ pageData?.totalElements | number }}</span> employees
          </div>

          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
              <span>Page size:</span>
              <select
                [ngModel]="pageSize"
                (ngModelChange)="onPageSizeChange($event)"
                class="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-300 text-xs focus:outline-none"
              >
                <option [ngValue]="10">10</option>
                <option [ngValue]="25">25</option>
                <option [ngValue]="50">50</option>
                <option [ngValue]="100">100</option>
              </select>
            </div>

            <div class="flex items-center gap-1">
              <button
                (click)="onPageChange(0)"
                [disabled]="currentPage === 0"
                class="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 disabled:opacity-40"
              >
                <i class="pi pi-angle-double-left"></i>
              </button>
              <button
                (click)="onPageChange(currentPage - 1)"
                [disabled]="currentPage === 0"
                class="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 disabled:opacity-40"
              >
                <i class="pi pi-angle-left"></i>
              </button>
              <span class="px-3 py-1 font-semibold text-white bg-slate-800 rounded">
                {{ currentPage + 1 }} / {{ pageData?.totalPages || 1 }}
              </span>
              <button
                (click)="onPageChange(currentPage + 1)"
                [disabled]="currentPage >= (pageData?.totalPages || 1) - 1"
                class="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 disabled:opacity-40"
              >
                <i class="pi pi-angle-right"></i>
              </button>
              <button
                (click)="onPageChange((pageData?.totalPages || 1) - 1)"
                [disabled]="currentPage >= (pageData?.totalPages || 1) - 1"
                class="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 disabled:opacity-40"
              >
                <i class="pi pi-angle-double-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Employee Salary Breakdown Modal / Drawer -->
    <div *ngIf="selectedEmployee" class="fixed inset-0 z-[1000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div class="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 class="font-bold text-lg text-white">
              {{ selectedEmployee.firstName }} {{ selectedEmployee.lastName }}
            </h3>
            <p class="text-xs text-indigo-400 font-mono">{{ selectedEmployee.empCode }} &bull; {{ selectedEmployee.departmentName || 'Engineering' }}</p>
          </div>
          <button (click)="selectedEmployee = null" class="text-slate-400 hover:text-white text-lg">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <!-- Compensation Breakdown Details -->
        <div class="grid grid-cols-2 gap-3 text-xs bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
          <div>
            <span class="text-slate-400">Base Pay:</span>
            <div class="font-bold text-slate-100 text-sm">\${{ selectedEmployee.compensation?.basePay | number:'1.2-2' }}</div>
          </div>
          <div>
            <span class="text-slate-400">PF Deduction:</span>
            <div class="font-bold text-amber-400 text-sm">\${{ selectedEmployee.compensation?.pfDeduction | number:'1.2-2' }}</div>
          </div>
          <div>
            <span class="text-slate-400">Other Deductions:</span>
            <div class="font-bold text-rose-400 text-sm">\${{ selectedEmployee.compensation?.otherDeductions | number:'1.2-2' }}</div>
          </div>
          <div>
            <span class="text-slate-400">Net Total CTC:</span>
            <div class="font-extrabold text-emerald-400 text-base">
              \${{ (selectedEmployee.compensation?.totalCompanyCost || selectedEmployee.compensation?.basePay) | number:'1.2-2' }}
            </div>
          </div>
          <div class="pt-2 border-t border-slate-800">
            <span class="text-slate-400">Paid Leaves Allowance:</span>
            <div class="font-semibold text-sky-300">{{ selectedEmployee.compensation?.paidLeavesAllowance }} Days</div>
          </div>
          <div class="pt-2 border-t border-slate-800">
            <span class="text-slate-400">Sick Leaves Allowance:</span>
            <div class="font-semibold text-sky-300">{{ selectedEmployee.compensation?.sickLeavesAllowance }} Days</div>
          </div>
        </div>

        <!-- Edit Compensation Form -->
        <div class="space-y-3 pt-2">
          <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider">Update Compensation Details</h4>
          
          <div class="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label class="block text-slate-400 mb-1">Base Pay (\$)</label>
              <input type="number" [(ngModel)]="editForm.basePay" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-semibold focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label class="block text-slate-400 mb-1">PF Deduction (\$)</label>
              <input type="number" [(ngModel)]="editForm.pfDeduction" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-semibold focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Other Deductions (\$)</label>
              <input type="number" [(ngModel)]="editForm.otherDeductions" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-semibold focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Paid Leaves (Days)</label>
              <input type="number" [(ngModel)]="editForm.paidLeavesAllowance" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-semibold focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Employee Status</label>
              <select [(ngModel)]="editForm.status" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-semibold focus:outline-none focus:border-indigo-500">
                <option value="ACTIVE">Active</option>
                <option value="TERMINATED">Terminated</option>
              </select>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-3 border-t border-slate-800">
          <button (click)="selectedEmployee = null" class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700">
            Cancel
          </button>
          <button (click)="saveSalaryUpdate()" [disabled]="isSaving" class="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all flex items-center gap-2">
            <i class="pi" [ngClass]="isSaving ? 'pi-spin pi-spinner' : 'pi-check'"></i>
            <span>{{ isSaving ? 'Saving...' : 'Save Compensation' }}</span>
          </button>
        </div>
      </div>
    </div>
  `
})
export class EmployeeDirectoryComponent implements OnInit, OnDestroy {
  pageData: PageResponse<Employee> | null = null;
  isLoading = false;
  isSeeding = false;
  isSaving = false;

  currentPage = 0;
  pageSize = 25;
  searchQuery = '';
  selectedDepartmentId: number | null = null;
  selectedCountryCode: string | null = null;
  selectedStatus: string | null = null;

  selectedEmployee: Employee | null = null;
  editForm: SalaryUpdate = {
    basePay: 0,
    pfDeduction: 0,
    otherDeductions: 0,
    paidLeavesAllowance: 0,
    sickLeavesAllowance: 0,
    status: 'ACTIVE'
  };

  private searchSubject = new Subject<string>();
  private refreshSubject = new BehaviorSubject<void>(undefined);
  private destroy$ = new Subject<void>();

  constructor(
    private employeeService: EmployeeService,
    private seederService: SeederService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // 300ms Debounced RxJS Search Input
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      this.searchQuery = query;
      this.currentPage = 0;
      this.loadData();
    });

    // Reactive Data Fetch Pipeline
    this.refreshSubject.pipe(
      tap(() => {
        this.isLoading = true;
        this.cdr.markForCheck();
      }),
      switchMap(() => this.employeeService.getEmployees(
        this.currentPage,
        this.pageSize,
        this.selectedDepartmentId || undefined,
        this.selectedCountryCode || undefined,
        this.selectedStatus || undefined,
        this.searchQuery || undefined
      ).pipe(
        catchError(() => of({
          content: [],
          totalElements: 0,
          totalPages: 0,
          size: this.pageSize,
          number: this.currentPage,
          first: true,
          last: true,
          empty: true
        }))
      )),
      takeUntil(this.destroy$)
    ).subscribe(data => {
      this.pageData = data;
      this.isLoading = false;
      this.cdr.markForCheck();
    });
  }

  loadData(): void {
    this.refreshSubject.next();
  }

  onSearchInput(value: string): void {
    this.searchSubject.next(value);
  }

  onDepartmentChange(deptId: number | null): void {
    this.selectedDepartmentId = deptId;
    this.currentPage = 0;
    this.loadData();
  }

  onCountryChange(country: string | null): void {
    this.selectedCountryCode = country;
    this.currentPage = 0;
    this.loadData();
  }

  onStatusChange(status: string | null): void {
    this.selectedStatus = status;
    this.currentPage = 0;
    this.loadData();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadData();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 0;
    this.loadData();
  }

  triggerSeeder(): void {
    this.isSeeding = true;
    this.cdr.markForCheck();

    this.seederService.seedData().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (result) => {
        this.isSeeding = false;
        this.cdr.markForCheck();
        this.currentPage = 0;
        this.loadData();
      },
      error: (err) => {
        console.error('Seeder error:', err);
        this.isSeeding = false;
        this.cdr.markForCheck();
        // Still reload data — partial seed may have succeeded
        this.currentPage = 0;
        this.loadData();
      }
    });
  }

  openEmployeeModal(emp: Employee): void {
    this.selectedEmployee = emp;
    if (emp.compensation) {
      this.editForm = {
        basePay: emp.compensation.basePay || 0,
        pfDeduction: emp.compensation.pfDeduction || 0,
        otherDeductions: emp.compensation.otherDeductions || 0,
        paidLeavesAllowance: emp.compensation.paidLeavesAllowance || 0,
        sickLeavesAllowance: emp.compensation.sickLeavesAllowance || 0,
        status: emp.status || 'ACTIVE'
      };
    }
  }

  saveSalaryUpdate(): void {
    if (!this.selectedEmployee) return;
    this.isSaving = true;
    this.cdr.markForCheck();

    this.employeeService.updateSalary(this.selectedEmployee.id, this.editForm).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (updated) => {
        this.isSaving = false;
        this.selectedEmployee = null;
        this.loadData();
      },
      error: () => {
        this.isSaving = false;
        this.cdr.markForCheck();
      }
    });
  }

  getStartIndex(): number {
    if (!this.pageData || this.pageData.totalElements === 0) return 0;
    return (this.currentPage * this.pageSize) + 1;
  }

  getEndIndex(): number {
    if (!this.pageData) return 0;
    return Math.min((this.currentPage + 1) * this.pageSize, this.pageData.totalElements);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
