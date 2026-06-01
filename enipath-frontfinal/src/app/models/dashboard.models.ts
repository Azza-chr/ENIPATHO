// Role: dashboard view models for student, teacher and department spaces.
export interface DashboardStat {
  label: string;
  value: string;
  detail: string;
}

export interface DashboardNotification {
  title: string;
  description: string;
  meta: string;
  isNew?: boolean;
  link?: string;
}
export interface DashboardProgress {
  label: string;
  progress: number;
  detail: string;
}

export interface StudentAcademicStat {
  id?: number;
  fullName: string;
  email?: string;
  niveau?: number;
  grp?: string;
  averageScore: number;
  completedQuizzes: number;
  passedQuizzes: number;
  lastActivity?: string;
}

export interface GroupAcademicStat {
  niveau?: number;
  grp: string;
  studentCount: number;
  averageScore: number;
  completedQuizzes: number;
  passRate: number;
}

export interface DashboardChartDatum {
  label: string;
  value: number;
  detail?: string;
  color?: string;
}

export interface DashboardChart {
  kind: 'bar' | 'pie';
  title: string;
  subtitle: string;
  unit?: string;
  items: DashboardChartDatum[];
}

export interface StudentDashboardOverview {
  stats: DashboardStat[];
  charts: DashboardChart[];
  notifications: DashboardNotification[];
  progress: DashboardProgress[];
  recentCourses: DashboardNotification[];
}

export interface TeacherDashboardOverview {
  stats: DashboardStat[];
  charts: DashboardChart[];
  publications: DashboardNotification[];
  learnerProgress: DashboardProgress[];
  studentStats: StudentAcademicStat[];
  announcements: DashboardNotification[];
}

export interface DepartmentDashboardOverview {
  stats: DashboardStat[];
  charts: DashboardChart[];
  classStats: DashboardProgress[];
  groupStats: GroupAcademicStat[];
  inbox: DashboardNotification[];
  announcements: DashboardNotification[];
}
