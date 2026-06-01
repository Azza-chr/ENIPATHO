// Role: shared auth and navigation contracts for the multi-role experience.
export type AppRole = 'etudiant' | 'enseignant' | 'chef-departement';
export type StudentLevel = 1 | 2 | 3;
export type StudentGroup = 'A' | 'B' | 'C' | 'D';

export interface ShellNavItem {
  label: string;
  path: string;
}

export interface DemoAccount {
  role: AppRole;
  email: string;
  password: string;
  fullName: string;
  subtitle: string;
  redirectTo: string;
}

export interface AuthSession {
  id?: number;
  role: AppRole;
  email: string;
  fullName: string;
  subtitle: string;
  redirectTo: string;
  niveau?: StudentLevel;
  grp?: StudentGroup;
  filiere?: string;
  departement?: string;
  specialite?: string;
  photoUrl?: string;
  telephone?: string;
  token?: string;
  expiresAt?: number;
}

export interface UserProfile extends AuthSession {
  statut?: string;
  createdAt?: string;
}
