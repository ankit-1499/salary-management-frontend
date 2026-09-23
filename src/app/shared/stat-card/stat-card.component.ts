import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-glass flex flex-col justify-between hover:border-slate-700 transition-colors">
      <div class="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
        <span>{{ title }}</span>
        <i [class]="iconClass + ' text-base'"></i>
      </div>
      <div class="text-2xl md:text-3xl font-extrabold text-white">
        {{ value }}
      </div>
      <div *ngIf="subtitle" class="text-[10px] text-slate-400 mt-1 font-medium">
        {{ subtitle }}
      </div>
    </div>
  `
})
export class StatCardComponent {
  @Input() title = '';
  @Input() value = '';
  @Input() subtitle = '';
  @Input() iconClass = 'pi pi-chart-bar text-indigo-400';
}
