export interface SalaryAnalyticsSummary {
  totalCompanyCost: number;
  globalAverageSalary: number;
  medianSalary: number;
  activeHeadcount: number;
}

export interface CountryBreakdown {
  countryCode: string;
  countryName: string;
  headcount: number;
  averageBaseSalary: number;
  totalCtcSpend: number;
}

export interface DepartmentBreakdown {
  departmentId: number;
  departmentName: string;
  departmentCode: string;
  headcount: number;
  totalCtcSpend: number;
}

export interface TopEarner {
  id: number;
  empCode: string;
  firstName: string;
  lastName: string;
  departmentName: string;
  countryCode: string;
  countryName: string;
  basePay: number;
  totalCompanyCost: number;
}
