export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  userEmail: string;
  userId: number;
  role: string;
  token: string | null;
}

export interface User {
  id: number;
  email: string;
  role: string;
  token: string | null;
}

export interface DashboardStats {
  totalEtudiants: number;
  totalEnseignants: number;
  etudiantsActifs: number;
  enseignantsActifs: number;
  totalCours: number;
  totalMatieres: number;
  totalChapitres: number;
  totalQuizzes: number;
  totalRessources: number;
  totalReclamations: number;
  reclamationsEnAttente: number;
  reclamationsResolues: number;
  messagesNonLus: number;
  notificationsActives: number;
}

export interface EtudiantSuivi {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  niveauScolaire: string;
  niveau: string;
  score: number;
  totalBadges: number;
  actif: boolean;
  dateInscription: string;
}

export interface EnseignantSuivi {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  departement: string;
  specialite: string;
  actif: boolean;
  totalMatieres: number;
  dateInscription: string;
}

export interface Notification {
  id: number;
  titre: string;
  contenu: string;
  cible: string;
  active: boolean;
  creeLe: string;
}

export interface Reclamation {
  id: number;
  sujet: string;
  contenu: string;
  description: string;
  statut: string;
  reponseAdmin: string | null;
  creeLe: string;
  traiteLe: string;
  utilisateurId: number;
  utilisateurNom: string;
  utilisateur?: { id: number; nom: string; prenom: string; email: string; };
}

export interface Message {
  id: number;
  sujet: string;
  contenu: string;
  expediteurId: number;
  expediteurNom: string;
  destinataireId: number;
  destinataireNom: string;
  envoyeLe: string;
  lu: boolean;
}
