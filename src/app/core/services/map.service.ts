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
    // 3-Letter ISO Codes
    ['USA', { code: 'USA', name: 'United States', lat: 37.0902, lng: -95.7129 }],
    ['CAN', { code: 'CAN', name: 'Canada', lat: 56.1304, lng: -106.3468 }],
    ['GBR', { code: 'GBR', name: 'United Kingdom', lat: 55.3781, lng: -3.4360 }],
    ['DEU', { code: 'DEU', name: 'Germany', lat: 51.1657, lng: 10.4515 }],
    ['FRA', { code: 'FRA', name: 'France', lat: 46.2276, lng: 2.2137 }],
    ['IND', { code: 'IND', name: 'India', lat: 20.5937, lng: 78.9629 }],
    ['AUS', { code: 'AUS', name: 'Australia', lat: -25.2744, lng: 133.7751 }],
    ['JPN', { code: 'JPN', name: 'Japan', lat: 36.2048, lng: 138.2529 }],
    ['SGP', { code: 'SGP', name: 'Singapore', lat: 1.3521, lng: 103.8198 }],
    ['BRA', { code: 'BRA', name: 'Brazil', lat: -14.2350, lng: -51.9253 }],
    ['ESP', { code: 'ESP', name: 'Spain', lat: 40.4637, lng: -3.7492 }],
    ['ITA', { code: 'ITA', name: 'Italy', lat: 41.8719, lng: 12.5674 }],
    ['NLD', { code: 'NLD', name: 'Netherlands', lat: 52.1326, lng: 5.2913 }],
    ['SWE', { code: 'SWE', name: 'Sweden', lat: 60.1282, lng: 18.6435 }],
    ['CHE', { code: 'CHE', name: 'Switzerland', lat: 46.8182, lng: 8.2275 }],
    ['MEX', { code: 'MEX', name: 'Mexico', lat: 23.6345, lng: -102.5528 }],
    ['KOR', { code: 'KOR', name: 'South Korea', lat: 35.9078, lng: 127.7669 }],

    // 2-Letter ISO Codes Aliases
    ['US', { code: 'US', name: 'United States', lat: 37.0902, lng: -95.7129 }],
    ['CA', { code: 'CA', name: 'Canada', lat: 56.1304, lng: -106.3468 }],
    ['GB', { code: 'GB', name: 'United Kingdom', lat: 55.3781, lng: -3.4360 }],
    ['DE', { code: 'DE', name: 'Germany', lat: 51.1657, lng: 10.4515 }],
    ['FR', { code: 'FR', name: 'France', lat: 46.2276, lng: 2.2137 }],
    ['IN', { code: 'IN', name: 'India', lat: 20.5937, lng: 78.9629 }],
    ['AU', { code: 'AU', name: 'Australia', lat: -25.2744, lng: 133.7751 }],
    ['JP', { code: 'JP', name: 'Japan', lat: 36.2048, lng: 138.2529 }],
    ['SG', { code: 'SG', name: 'Singapore', lat: 1.3521, lng: 103.8198 }],
    ['BR', { code: 'BR', name: 'Brazil', lat: -14.2350, lng: -51.9253 }],
    ['ES', { code: 'ES', name: 'Spain', lat: 40.4637, lng: -3.7492 }],
    ['IT', { code: 'IT', name: 'Italy', lat: 41.8719, lng: 12.5674 }],
    ['NL', { code: 'NL', name: 'Netherlands', lat: 52.1326, lng: 5.2913 }],
    ['SE', { code: 'SE', name: 'Sweden', lat: 60.1282, lng: 18.6435 }],
    ['CH', { code: 'CH', name: 'Switzerland', lat: 46.8182, lng: 8.2275 }],
    ['MX', { code: 'MX', name: 'Mexico', lat: 23.6345, lng: -102.5528 }],
    ['KR', { code: 'KR', name: 'South Korea', lat: 35.9078, lng: 127.7669 }]
  ]);

  getCountryLocation(code: string): CountryLocation | undefined {
    if (!code) return undefined;
    return this.countryLocations.get(code.trim().toUpperCase());
  }

  getAllLocations(): CountryLocation[] {
    // Unique locations by name
    const unique = new Map<string, CountryLocation>();
    this.countryLocations.forEach((loc) => {
      if (!unique.has(loc.name)) {
        unique.set(loc.name, loc);
      }
    });
    return Array.from(unique.values());
  }
}
