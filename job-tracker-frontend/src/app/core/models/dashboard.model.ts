export interface DashboardStats {
  total: number;
  applied: number;
  inProgress: number;
  offers: number;
  rejected: number;
  responseRate: number;
  successRate: number;
  byStatus: Record<string, number>;
}