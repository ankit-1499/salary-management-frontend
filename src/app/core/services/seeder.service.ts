import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SeedResponse {
  status: string;
  message: string;
  totalEmployees: number;
}

@Injectable({
  providedIn: 'root'
})
export class SeederService {
  private readonly baseUrl = 'http://localhost:8080/api/v1/seed';

  constructor(private http: HttpClient) {}

  seedData(): Observable<SeedResponse> {
    return this.http.post<SeedResponse>(this.baseUrl, {});
  }
}
