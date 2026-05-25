export type ApplicationStatus =
  | 'SAVED'
  | 'APPLIED'
  | 'HR_INTERVIEW'
  | 'TECH_INTERVIEW'
  | 'FINAL_INTERVIEW'
  | 'OFFER'
  | 'REJECTED';

export interface Application {
  id: string;
  company: string;
  position: string;
  status: ApplicationStatus;
  salary?: number;
  location?: string;
  applicationDate?: string;
  jobUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationCreateRequest {
  company: string;
  position: string;
  status: ApplicationStatus;
  salary?: number;
  location?: string;
  applicationDate?: string;
  jobUrl?: string;
  notes?: string;
}

export interface ApplicationUpdateRequest extends Partial<ApplicationCreateRequest> {}

// Réponse paginée Spring
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface ApplicationFilters {
  keyword?: string;
  company?: string;
  status?: ApplicationStatus | '';
}