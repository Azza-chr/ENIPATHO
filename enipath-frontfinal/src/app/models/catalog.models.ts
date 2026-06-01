export interface Semestre {
  id: number;
  nom: string;
  ordre: number;
  code?: string;
  matieres?: Matiere[];
}

export interface Matiere {
  id: number;
  nom: string;
  description: string;
  semestreId: number;
  code?: string;
  enseignant?: string;
  semestreLibelle?: string;
  chapitres?: Chapitre[];
  image?: string;
}


export interface Ressource {
  id: number;
  titre: string;
  type: string;
  url?: string;
  description?: string;
  mimeType?: string;
}

export interface QuizResume {
  id: number;
  titre: string;
  description?: string;
  durationMinutes?: number;
  passingScore?: number;
}

export interface Chapitre {
  id: number;
  titre: string;
  description: string;
  ordre: number;
  published?: boolean;
  ressources: Ressource[];
  quiz?: QuizResume;
  quizId?: number;
}

export interface CoursPdf {
  id: number;
  titre: string;
  description: string;
  originalFileName: string;
  fileSize?: number;
  createdAt?: string;
  matiereId: number;
  groupeId?: number;
  quizId?: number;
  viewUrl: string;
  downloadUrl: string;
}

export interface Groupe {
  id: number;
  nom: string;
  niveau?: string;
  filiere?: string;
}
