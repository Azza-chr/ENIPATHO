// Role: application routes for the temporary multi-role academic platform.
import { Routes } from '@angular/router';

import { AnnouncementsPageComponent } from './pages/announcements-page/announcements-page.component';
import { AboutPageComponent } from './pages/about-page/about-page.component';
import { FeaturePageComponent } from './pages/feature-page/feature-page.component';
import { DepartmentDashboardPageComponent } from './pages/department-dashboard-page/department-dashboard-page.component';
import { ExamenPageComponent } from './pages/examen-page/examen-page.component';
import { LibraryPageComponent } from './pages/library-page/library-page.component';
import { MessagesPageComponent } from './pages/messages-page/messages-page.component';
import { QuizPageComponent } from './pages/quiz-page/quiz-page.component';
import { ResultPageComponent } from './pages/result-page/result-page.component';
import { RoleShellComponent } from './pages/role-shell/role-shell.component';
import { StudentDashboardPageComponent } from './pages/student-dashboard-page/student-dashboard-page.component';
import { StudentProfilePageComponent } from './pages/student-profile-page/student-profile-page.component';
import { SubjectDetailPageComponent } from './pages/subject-detail-page/subject-detail-page.component';
import { TeacherDashboardPageComponent } from './pages/teacher-dashboard-page/teacher-dashboard-page.component';
import { TeacherPageComponent } from './pages/teacher-page/teacher-page.component';
import { FormationList } from './pages/formation-list/formation-list';
import { FormationDetail } from './pages/formation-detail/formation-detail';
import { FormationCours } from './pages/formation-cours/formation-cours';

export const routes: Routes = [
  { path: '', redirectTo: 'etudiant', pathMatch: 'full' },
  {
    path: 'etudiant',
    component: RoleShellComponent,
    data: {
      role: 'etudiant',
      shellTitle: 'Espace etudiant',
      shellSubtitle: 'Parcours numerique',
      homeLink: '/etudiant',
      navItems: [
        { label: 'Cours', path: '/etudiant/cours' },
        { label: 'Formations', path: '/etudiant/formations' },
        { label: 'AI', path: '/etudiant/ai' },
        { label: 'Profil', path: '/etudiant/profil' }
      ]
    },
    children: [
      { path: '', component: StudentDashboardPageComponent },
      { path: 'cours', component: LibraryPageComponent },
      { path: 'formations', component: FormationList },
      { path: 'formations/:id', component: FormationDetail },
      { path: 'formations/:formationId/module/:moduleId/cours', component: FormationCours },
      { path: 'formations/:formationId/examen/:quizzId', component: ExamenPageComponent },
      { path: 'formations/:formationId/examen-final/:quizzId', component: ExamenPageComponent },
      {
        path: 'ai',
        component: FeaturePageComponent,
        data: {
          feature: {
            eyebrow: 'Assistant AI',
            title: 'Espace AI en attente de branchement',
            description: 'Le module IA pourra etre fusionne ici sans refaire la navigation ou le design global.',
            stats: [
              { label: 'Prompts a venir', value: '6', detail: 'Zone reservee' },
              { label: 'Connexion backend', value: 'En attente', detail: 'A integrer avec votre binome' }
            ],
            cards: [
              {
                title: 'Assistant de revision',
                text: 'Cet emplacement accueillera les interactions IA, ressources et recommandations personnalisees.',
                meta: 'Future integration'
              },
              {
                title: 'Experience utilisateur',
                text: 'Le theme et la structure de page sont deja harmonises avec le reste de la plateforme.',
                meta: 'Dark mode coherent'
              }
            ]
          }
        }
      },
      { path: 'profil', component: StudentProfilePageComponent },
      { path: 'a-propos', component: AboutPageComponent },
      { path: 'annonces', component: AnnouncementsPageComponent },
      { path: 'matieres/:matiereId', component: SubjectDetailPageComponent },
      { path: 'chapitres/:chapitreId/quiz', component: QuizPageComponent },
      { path: 'quizzes/:quizId', component: QuizPageComponent },
      { path: 'resultat', component: ResultPageComponent }
    ]
  },
  {
    path: 'enseignant',
    component: RoleShellComponent,
    data: {
      role: 'enseignant',
      shellTitle: 'Espace enseignant',
      shellSubtitle: 'Pilotage pedagogique',
      homeLink: '/enseignant',
      navItems: [
        { label: 'Cours', path: '/enseignant/cours' },
        { label: 'Statistiques', path: '/enseignant/statistiques' },
        { label: 'Messages', path: '/enseignant/messages' },
        { label: 'Annonces', path: '/enseignant/annonces' },
        { label: 'Profil', path: '/enseignant/profil' }
      ]
    },
    children: [
      { path: '', component: TeacherDashboardPageComponent },
      { path: 'cours', component: TeacherPageComponent },
      { path: 'statistiques', component: TeacherDashboardPageComponent, data: { view: 'statistics' } },
      { path: 'annonces', component: AnnouncementsPageComponent },
      { path: 'messages', component: MessagesPageComponent },
      { path: 'profil', component: StudentProfilePageComponent },
      { path: 'a-propos', component: AboutPageComponent }
    ]
  },
  {
    path: 'chef-departement',
    component: RoleShellComponent,
    data: {
      role: 'chef-departement',
      shellTitle: 'Espace chef de departement',
      shellSubtitle: 'Supervision academique',
      homeLink: '/chef-departement',
      navItems: [
        { label: 'Statistiques', path: '/chef-departement/statistiques' },
        { label: 'Messages', path: '/chef-departement/messages' },
        { label: 'Profil', path: '/chef-departement/profil' }
      ]
    },
    children: [
      { path: '', component: DepartmentDashboardPageComponent },
      { path: 'statistiques', component: DepartmentDashboardPageComponent, data: { view: 'statistics' } },
      { path: 'messages', component: MessagesPageComponent },
      { path: 'annonces', component: AnnouncementsPageComponent },
      { path: 'profil', component: StudentProfilePageComponent },
      { path: 'a-propos', component: AboutPageComponent }
    ]
  },
  { path: '**', redirectTo: 'etudiant' }
];
