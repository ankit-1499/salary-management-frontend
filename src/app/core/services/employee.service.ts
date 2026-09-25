import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee, EmployeeRequest, SalaryUpdate } from '../models/employee.model';
import { PageResponse } from '../models/page-response.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private readonly baseUrl = 'https://salary-management-backend-eta.vercel.app/api/v1/employees';

  constructor(private http: HttpClient) {}

  getEmployees(
    page: number = 0,
    size: number = 25,
    departmentId?: number,
    countryCode?: string,
    status?: string,
    search?: string
  ): Observable<PageResponse<Employee>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (departmentId) params = params.set('departmentId', departmentId.toString());
    if (countryCode) params = params.set('countryCode', countryCode);
    if (status) params = params.set('status', status);
    if (search && search.trim()) params = params.set('search', search.trim());

    return this.http.get<PageResponse<Employee>>(this.baseUrl, { params });
  }

  getEmployeeById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.baseUrl}/${id}`);
  }

  createEmployee(employee: EmployeeRequest): Observable<Employee> {
    return this.http.post<Employee>(this.baseUrl, employee);
  }

  updateSalary(id: number, salaryUpdate: SalaryUpdate): Observable<Employee> {
    return this.http.put<Employee>(`${this.baseUrl}/${id}/salary`, salaryUpdate);
  }
}
