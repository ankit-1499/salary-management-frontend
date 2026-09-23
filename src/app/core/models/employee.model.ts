export interface Compensation {
  basePay: number;
  pfDeduction: number;
  otherDeductions: number;
  paidLeavesAllowance: number;
  sickLeavesAllowance: number;
  totalCompanyCost?: number;
}

export interface Employee {
  id: number;
  empCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  departmentId?: number;
  departmentName?: string;
  departmentCode?: string;
  jobPositionId?: number;
  jobTitle?: string;
  countryCode: string;
  countryName?: string;
  currencyCode?: string;
  status: string;
  dateOfJoining: string;
  compensation?: Compensation;
}

export interface EmployeeRequest {
  empCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  departmentId: number;
  jobPositionId: number;
  countryCode: string;
  status: string;
  dateOfJoining: string;
  compensation: Compensation;
}

export interface SalaryUpdate {
  basePay: number;
  pfDeduction: number;
  otherDeductions: number;
  paidLeavesAllowance: number;
  sickLeavesAllowance: number;
}
