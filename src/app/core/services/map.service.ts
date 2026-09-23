import { Injectable } from '@angular/core';

export interface CountryLocation {
  code: string;
  name: string;
  lat: number;
  lng: number;
}

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private readonly countryLocations: Map<string, CountryLocation> = new Map([
    ['USA', { code: 'USA', name: 'United States', lat: 37.0902, lng: -95.7129 }],
    ['CAN', { code: 'CAN', name: 'Canada', lat: 56.1304, lng: -106.3468 }],
    ['GBR', { code: 'GBR', name: 'United Kingdom', lat: 55.3781, lng: -3.4360 }],
    ['DEU', { code: 'DEU', name: 'Germany', lat: 51.1657, lng: 10.4515 }],
    ['FRA', { code: 'FRA', name: 'France', lat: 46.2276, lng: 2.2137 }],
    ['IND', { code: 'IND', name: 'India', lat: 20.5937, lng: 78.9629 }],
    ['AUS', { code: 'AUS', name: 'Australia', lat: -25.2744, lng: 133.7751 }],
    ['JPN', { code: 'JPN', name: 'Japan', lat: 36.2048, lng: 138.2529 }],
    ['SGP', { code: 'SGP', name: 'Singapore', lat: 1.3521, lng: 103.8198 }],
    ['BRA', { code: 'BRA', name: 'Brazil', lat: -14.2350, lng: -51.9253 }]
  ]);

  getCountryLocation(code: string): CountryLocation | undefined {
    return this.countryLocations.get(code.toUpperCase());
  }

  getAllLocations(): CountryLocation[] {
    return Array.from(this.countryLocations.values());
  }
}
