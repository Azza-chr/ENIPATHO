import { Routes } from '@angular/router';
import { AnnouncementsPageComponent } from './pages/announcements-page/announcements-page.component';
import { AboutPageComponent } from './pages/about-page/about-page.component';
import { DepartmentDashboardPageComponent } from './pages/department-dashboard-page/department-dashboard-page.component';
import { DashboardComponent } from './pages/admin-dashboard-page/dashboard';
import { Examen } from './pages/examen/examen';
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
import { LoginComponent } from './pages/login-page/login';
import { MesBadges } from './pages/mes-badges/mes-badges';
import { MesCertifications } from './pages/mes-certifications/mes-certifications';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
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
        { label: 'Mes Badges', path: '/etudiant/badges' },
        { label: 'Certifications', path: '/etudiant/certifications' },
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
      { path: 'formations/:formationId/examen/:quizzId', component: Examen },
      { path: 'formations/:formationId/examen-final/:quizzId', component: Examen },
      { path: 'badges', component: MesBadges },
      { path: 'certifications', component: MesCertifications },
      {
        path: 'ai',
        loadComponent: () =>
          import('./pages/ai-page/ai-landing.component').then(m => m.AiLandingComponent)
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
      { path: '', component: DashboardComponent },
      { path: 'statistiques', component: DepartmentDashboardPageComponent, data: { view: 'statistics' } },
      { path: 'messages', component: MessagesPageComponent },
      { path: 'annonces', component: AnnouncementsPageComponent },
      { path: 'profil', component: StudentProfilePageComponent },
      { path: 'a-propos', component: AboutPageComponent }
    ]
  },
  { path: '**', redirectTo: 'login' }
];