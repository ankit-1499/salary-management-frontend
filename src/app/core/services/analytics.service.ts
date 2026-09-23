import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CountryBreakdown, DepartmentBreakdown, SalaryAnalyticsSummary, TopEarner } from '../models/analytics.model';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private readonly baseUrl = 'http://localhost:8080/api/v1/analytics';

  constructor(private http: HttpClient) {}

  getSummary(): Observable<SalaryAnalyticsSummary> {
    return this.http.get<SalaryAnalyticsSummary>(`${this.baseUrl}/summary`);
  }

  getCountryBreakdown(): Observable<CountryBreakdown[]> {
    return this.http.get<CountryBreakdown[]>(`${this.baseUrl}/breakdown/country`);
  }

  getDepartmentBreakdown(): Observable<DepartmentBreakdown[]> {
    return this.http.get<DepartmentBreakdown[]>(`${this.baseUrl}/breakdown/department`);
  }

  getTopEarners(countryCode?: string, limit: number = 10): Observable<TopEarner[]> {
    let params = new HttpParams().set('limit', limit.toString());
    if (countryCode && countryCode.trim()) {
      params = params.set('countryCode', countryCode.trim());
    }
    return this.http.get<TopEarner[]>(`${this.baseUrl}/top-earners`, { params });
  }
}
