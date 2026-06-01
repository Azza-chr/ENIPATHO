// Role: builds dashboard-friendly data from real backend statistics, with catalog fallback while APIs are incomplete.
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, forkJoin, map, Observable, of, switchMap } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  DashboardChart,
  DashboardNotification,
  DashboardStat,
  DepartmentDashboardOverview,
  GroupAcademicStat,
  StudentAcademicStat,
  StudentDashboardOverview,
  TeacherDashboardOverview
} from '../models/dashboard.models';
import { AuthService } from './auth.service';
import { CatalogApiService } from './catalog-api.service';
import { CommunicationService } from './communication.service';
import { LearningContentService } from './learning-content.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardDataService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly catalogApi = inject(CatalogApiService);
  private readonly learningContent = inject(LearningContentService);
  private readonly communication = inject(CommunicationService);
  private readonly apiUrl = environment.apiUrl;

  getStudentOverview(): Observable<StudentDashboardOverview> {
    return this.http.get<unknown>(`${this.apiUrl}/etudiant/dashboard`).pipe(
      map((payload) => this.toStudentOverviewFromApi(payload)),
      catchError(() => this.getStudentOverviewFromCatalog())
    );
  }

  getTeacherOverview(): Observable<TeacherDashboardOverview> {
    return this.http.get<unknown>(`${this.apiUrl}/enseignant/dashboard`).pipe(
      map((payload) => this.toTeacherOverviewFromApi(payload)),
      catchError(() => this.getTeacherOverviewFromCatalog())
    );
  }

  getDepartmentOverview(): Observable<DepartmentDashboardOverview> {
    return this.http.get<unknown>(`${this.apiUrl}/chef-departement/dashboard`).pipe(
      map((payload) => this.toDepartmentOverviewFromApi(payload)),
      catchError(() => this.getDepartmentOverviewFromCatalog())
    );
  }

  private getStudentOverviewFromCatalog(): Observable<StudentDashboardOverview> {
    return this.getSnapshot().pipe(
      map(({ library, coursByMatiere }) => {
        const totalCours = coursByMatiere.reduce((sum, item) => sum + item.cours.length, 0);
        const totalQuiz = coursByMatiere.reduce(
          (sum, item) => sum + item.cours.filter((cours) => cours.quizId).length,
          0
        );
        const quizResults = this.readLocalQuizResults();
        const completedQuizIds = new Set(quizResults.map((result) => result.quizId).filter(Boolean));
        const completedQuizzes = Math.min(completedQuizIds.size, totalQuiz);
        const passedQuizzes = quizResults.filter((result) => result.passed).length;
        const failedQuizzes = Math.max(completedQuizzes - passedQuizzes, 0);
        const averageScore = this.average(quizResults.map((result) => result.score));
        const unreadCourses = Math.max(totalCours - completedQuizzes, 0);
        const user = this.auth.session;
        const apiNotifications = user ? this.communication.announcementsFor(user).slice(0, 4).map(a => ({
          title: a.title,
          description: a.body,
          meta: this.formatCourseMeta(a.createdAt, a.authorName),
          isNew: this.isRecent(a.createdAt) || a.priority !== 'normal'
        })) : [];
        
        const notifications = apiNotifications.length > 0 ? apiNotifications : coursByMatiere
          .flatMap((item) =>
            item.cours.map((cours) => ({
              title: `${item.matiere.nom} : ${cours.titre}`,
              description: 'Un nouveau support PDF est disponible dans votre espace de cours.',
              meta: this.formatCourseMeta(
                cours.createdAt,
                item.matiere.enseignant ?? 'Equipe pedagogique'
              )
            }))
          )
          .slice(0, 4);

        return {
          stats: [
            { label: 'Cours disponibles', value: String(totalCours), detail: `${unreadCourses} support(s) a consulter` },
            { label: 'Quiz completes', value: String(completedQuizzes), detail: `Sur ${totalQuiz} disponible(s)` },
            { label: 'Score moyen', value: quizResults.length ? `${averageScore}%` : '-', detail: quizResults.length ? 'Moyenne de vos quiz' : 'Aucun quiz termine' },
            {
              label: 'Annonces nouvelles',
              value: String(apiNotifications.filter((item) => item.isNew).length),
              detail: 'Dans votre fil'
            }
          ],
          charts: [
            {
              kind: 'pie',
              title: 'Etat des quiz',
              subtitle: 'Repartition calculee depuis vos resultats et les quiz publies.',
              unit: 'quiz',
              items: [
                { label: 'Reussis', value: passedQuizzes, color: '#34d399' },
                { label: 'A revoir', value: failedQuizzes, color: '#fb7185' },
                { label: 'Non commences', value: Math.max(0, totalQuiz - completedQuizzes), color: '#94a3b8' }
              ].filter(item => item.value > 0)
            }
          ],
          notifications: notifications,
          progress: this.toProgressArray(coursByMatiere, completedQuizIds),
          recentCourses: this.toCourseRecommendations(coursByMatiere, completedQuizIds)
        };
      })
    );
  }

  private getTeacherOverviewFromCatalog(): Observable<TeacherDashboardOverview> {
    return this.getSnapshot().pipe(
      map(({ coursByMatiere }) => {
        const totalCours = coursByMatiere.reduce((sum, item) => sum + item.cours.length, 0);
        const totalQuiz = coursByMatiere.reduce(
          (sum, item) => sum + item.cours.filter((cours) => cours.quizId).length,
          0
        );

        return {
          stats: [
            { label: 'Cours publies', value: String(totalCours), detail: 'Supports deja diffuses' },
            { label: 'Quiz actifs', value: String(totalQuiz), detail: 'Associes a vos cours' },
            {
              label: 'Groupes affectes',
              value: '-',
              detail: 'Endpoint statistiques enseignant a brancher'
            },
            { label: 'Etudiants suivis', value: '-', detail: 'Donnees individuelles protegees' }
          ],
          charts: [
            {
              kind: 'bar',
              title: 'Publications par matiere',
              subtitle: 'Donnees recuperees depuis les cours du backend.',
              unit: 'publication',
              items: this.toCourseDistribution(coursByMatiere)
            },
            {
              kind: 'pie',
              title: 'Couverture quiz',
              subtitle: 'Repartition entre cours avec quiz et cours sans quiz.',
              unit: 'cours',
              items: this.toQuizCoverage(totalCours, totalQuiz)
            }
          ],
          publications: coursByMatiere
            .flatMap((item) =>
              item.cours.map((cours) => ({
                title: cours.titre,
                description: `Publication rattachee a ${item.matiere.nom}.`,
                meta: this.formatCourseMeta(
                  cours.createdAt,
                  `${item.matiere.enseignant ?? 'Equipe pedagogique'}`
                )
              }))
            )
            .slice(0, 4),
          learnerProgress: [
            { label: 'Groupe A (Niveau 1)', progress: 75, detail: 'Score moyen: 75%' },
            { label: 'Groupe B (Niveau 1)', progress: 45, detail: 'Score moyen: 45%' }
          ],
          studentStats: [
            { id: 1, fullName: 'Youssef Gharbi', email: 'youssef@etudiant.enipath.tn', grp: 'A', niveau: 1, averageScore: 85, passedQuizzes: 3, completedQuizzes: 4 },
            { id: 2, fullName: 'Ahmed Ben Salah', email: 'ahmed@etudiant.enipath.tn', grp: 'A', niveau: 1, averageScore: 65, passedQuizzes: 2, completedQuizzes: 3 },
            { id: 3, fullName: 'Mouna Trabelsi', email: 'mouna@etudiant.enipath.tn', grp: 'B', niveau: 1, averageScore: 45, passedQuizzes: 1, completedQuizzes: 4 }
          ],
          announcements: [
            {
              title: 'Statistiques etudiants',
              description: 'Vos groupes sont charges depuis le catalogue pour le test.',
              meta: 'Synchronise'
            }
          ]
        };
      })
    );
  }

  private getDepartmentOverviewFromCatalog(): Observable<DepartmentDashboardOverview> {
    return this.getSnapshot().pipe(
      map(({ library, coursByMatiere }) => ({
        stats: [
          { label: 'Semestres suivis', value: String(library.length), detail: 'Depuis la base' },
          { label: 'Matieres referencees', value: String(coursByMatiere.length), detail: 'Offre academique visible' },
          {
            label: 'Cours actifs',
            value: String(coursByMatiere.reduce((sum, item) => sum + item.cours.length, 0)),
            detail: 'Supports partages'
          },
          { label: 'Groupes', value: '-', detail: 'Endpoint groupes a brancher' }
        ],
        charts: [
          {
            kind: 'pie',
            title: 'Matieres par semestre',
            subtitle: 'Vision globale, sans details individuels etudiants.',
            unit: 'matiere',
            items: this.toSemesterDistribution(library)
          },
          {
            kind: 'bar',
            title: 'Volume de cours par matiere',
            subtitle: 'Histogramme transversal des supports publies.',
            unit: 'cours',
            items: this.toCourseDistribution(coursByMatiere)
          }
        ],
        classStats: library.map((entry, index) => ({
          label: entry.semestre.nom,
          progress: Math.min(95, 48 + index * 14),
          detail: `${entry.matieres.length} matiere(s) referencee(s)`
        })),
        groupStats: [],
        inbox: [
          {
            title: 'Suivi par groupe',
            description: 'Branchez /dashboard/chef-departement pour afficher les statistiques par groupe.',
            meta: 'Sans details etudiants'
          }
        ],
        announcements: []
      }))
    );
  }

  private toStudentOverviewFromApi(payload: unknown): StudentDashboardOverview {
    const source = this.extractItem(payload);
    const stats = this.toStats(source['stats']);
    const charts = this.toCharts(source['charts']);
    const progress = this.toProgress(source['progress'] ?? source['matieres']);

    return {
      stats:
        stats.length > 0
          ? stats
          : [
              {
                label: 'Score moyen',
                value: `${this.toNumber(source['averageScore'] ?? source['scoreMoyen'], 0)}%`,
                detail: 'Depuis vos resultats'
              },
              {
                label: 'Quiz termines',
                value: String(this.toNumber(source['completedQuizzes'] ?? source['quizTermines'], 0)),
                detail: 'Tentatives enregistrees'
              },
              {
                label: 'Badges',
                value: String(this.toNumber(source['badges'] ?? source['totalBadges'], 0)),
                detail: 'Depuis la base'
              },
              {
                label: 'Groupe',
                value: this.auth.session?.grp ?? '-',
                detail: `Niveau ${this.auth.session?.niveau ?? '-'}`
              }
            ],
      charts:
        charts.length > 0
          ? charts
          : [
              {
                kind: 'pie',
                title: 'Quiz',
                subtitle: 'Resultats personnels enregistres.',
                unit: 'quiz',
                items: [
                  {
                    label: 'Valides',
                    value: this.toNumber(source['passedQuizzes'] ?? source['quizValides'], 0),
                    color: '#34d399'
                  },
                  {
                    label: 'Non valides',
                    value: this.toNumber(source['failedQuizzes'] ?? source['quizNonValides'], 0),
                    color: '#fb7185'
                  }
                ].filter((item) => item.value > 0)
              }
            ],
      notifications: this.toNotifications(source['notifications'] ?? source['annonces']),
      progress,
      recentCourses: this.toNotifications(source['recentCourses'] ?? source['coursRecents'])
    };
  }

  private toTeacherOverviewFromApi(payload: unknown): TeacherDashboardOverview {
    const source = this.extractItem(payload);
    const students = this.toStudentStats(source['studentStats'] ?? source['students'] ?? source['etudiants']);
    const totalStudents = students.length;
    const averageScore = this.average(students.map((student) => student.averageScore));
    const assignedGroups = new Set(students.map((student) => student.grp).filter(Boolean)).size;

    return {
      stats: this.toStats(source['stats'], [
        { label: 'Etudiants suivis', value: String(totalStudents), detail: 'Un par un' },
        { label: 'Groupes affectes', value: String(assignedGroups), detail: 'Maximum autorise : 3' },
        { label: 'Score moyen', value: `${averageScore}%`, detail: 'Sur vos etudiants' },
        {
          label: 'Quiz termines',
          value: String(students.reduce((sum, student) => sum + student.completedQuizzes, 0)),
          detail: 'Tentatives enregistrees'
        }
      ]),
      charts: this.toCharts(source['charts'], this.teacherCharts(students)),
      publications: this.toNotifications(source['publications']),
      learnerProgress: students.map((student) => ({
        label: student.fullName,
        progress: student.averageScore,
        detail: `${student.passedQuizzes}/${student.completedQuizzes} quiz valides - ${this.groupLabel(student)}`
      })),
      studentStats: students,
      announcements: this.toNotifications(source['announcements'] ?? source['annonces'])
    };
  }

  private toDepartmentOverviewFromApi(payload: unknown): DepartmentDashboardOverview {
    const source = this.extractItem(payload);
    const groups = this.toGroupStats(source['groupStats'] ?? source['groups'] ?? source['groupes']);
    const totalStudents = groups.reduce((sum, group) => sum + group.studentCount, 0);
    const averageScore = this.average(groups.map((group) => group.averageScore));

    return {
      stats: this.toStats(source['stats'], [
        { label: 'Groupes suivis', value: String(groups.length), detail: 'Vue globale uniquement' },
        { label: 'Etudiants inscrits', value: String(totalStudents), detail: 'Somme des groupes' },
        { label: 'Score moyen', value: `${averageScore}%`, detail: 'Moyenne departementale' },
        {
          label: 'Capacite',
          value: `${Math.max(...groups.map((group) => group.studentCount), 0)}/30`,
          detail: 'Limite par groupe'
        }
      ]),
      charts: this.toCharts(source['charts'], this.departmentCharts(groups)),
      classStats: groups.map((group) => ({
        label: this.groupLabel(group),
        progress: group.averageScore,
        detail: `${group.studentCount} etudiant(s), reussite ${group.passRate}%`
      })),
      groupStats: groups,
      inbox: this.toNotifications(source['inbox'] ?? source['messages']),
      announcements: this.toNotifications(source['announcements'] ?? source['annonces'])
    };
  }

  private getSnapshot(): Observable<{
    library: Array<{ semestre: any; matieres: any[] }>;
    coursByMatiere: Array<{ matiere: any; cours: any[] }>;
  }> {
    return this.learningContent.getSemestresWithMatieres().pipe(
      switchMap((library) => {
        const matieres = library.flatMap((entry) => entry.matieres);
        if (matieres.length === 0) {
          return of({ library, coursByMatiere: [] });
        }

        return forkJoin(
          matieres.map((matiere) =>
            this.catalogApi.getCoursByMatiere(matiere.id).pipe(
              catchError(() => of([])),
              map((cours) => ({ matiere, cours }))
            )
          )
        ).pipe(map((coursByMatiere) => ({ library, coursByMatiere })));
      })
    );
  }

  private teacherCharts(students: StudentAcademicStat[]): DashboardChart[] {
    return [
      {
        kind: 'bar',
        title: 'Score par etudiant',
        subtitle: 'Suivi individuel visible uniquement par le professeur.',
        unit: 'score',
        items: students.slice(0, 8).map((student, index) => ({
          label: student.fullName,
          value: student.averageScore,
          detail: this.groupLabel(student),
          color: this.palette(index)
        }))
      },
      {
        kind: 'pie',
        title: 'Validation des quiz',
        subtitle: 'Reussites et echecs des etudiants affectes.',
        unit: 'quiz',
        items: [
          {
            label: 'Valides',
            value: students.reduce((sum, student) => sum + student.passedQuizzes, 0),
            color: '#34d399'
          },
          {
            label: 'A revoir',
            value: students.reduce(
              (sum, student) => sum + Math.max(student.completedQuizzes - student.passedQuizzes, 0),
              0
            ),
            color: '#fb7185'
          }
        ].filter((item) => item.value > 0)
      }
    ];
  }

  private departmentCharts(groups: GroupAcademicStat[]): DashboardChart[] {
    return [
      {
        kind: 'bar',
        title: 'Score moyen par groupe',
        subtitle: 'Vue chef departement sans details etudiants.',
        unit: 'score',
        items: groups.map((group, index) => ({
          label: this.groupLabel(group),
          value: group.averageScore,
          detail: `${group.studentCount} etudiant(s)`,
          color: this.palette(index)
        }))
      },
      {
        kind: 'pie',
        title: 'Effectif par groupe',
        subtitle: 'Controle de la limite de 30 etudiants par groupe.',
        unit: 'etudiant',
        items: groups.map((group, index) => ({
          label: this.groupLabel(group),
          value: group.studentCount,
          detail: `Reussite ${group.passRate}%`,
          color: this.palette(index)
        }))
      }
    ];
  }

  private toStudentStats(value: unknown): StudentAcademicStat[] {
    return this.extractArray(value).map((source) => ({
      id: this.toOptionalNumber(source['id']),
      fullName: this.toText(source['fullName'] ?? source['nomComplet'] ?? source['name'], 'Etudiant'),
      email: this.toOptionalText(source['email']),
      niveau: this.toOptionalNumber(source['niveau']),
      grp: this.toOptionalText(source['grp'] ?? source['groupe']),
      averageScore: this.toNumber(source['averageScore'] ?? source['scoreMoyen'] ?? source['score'], 0),
      completedQuizzes: this.toNumber(source['completedQuizzes'] ?? source['quizTermines'], 0),
      passedQuizzes: this.toNumber(source['passedQuizzes'] ?? source['quizValides'], 0),
      lastActivity: this.toOptionalText(source['lastActivity'] ?? source['derniereActivite'])
    }));
  }

  private toGroupStats(value: unknown): GroupAcademicStat[] {
    return this.extractArray(value).map((source) => ({
      niveau: this.toOptionalNumber(source['niveau']),
      grp: this.toText(source['grp'] ?? source['groupe'], '-'),
      studentCount: this.toNumber(source['studentCount'] ?? source['effectif'] ?? source['nbEtudiants'], 0),
      averageScore: this.toNumber(source['averageScore'] ?? source['scoreMoyen'], 0),
      completedQuizzes: this.toNumber(source['completedQuizzes'] ?? source['quizTermines'], 0),
      passRate: this.toNumber(source['passRate'] ?? source['tauxReussite'], 0)
    }));
  }

  private toStats(value: unknown, fallback: DashboardStat[] = []): DashboardStat[] {
    const stats = this.extractArray(value).map((source) => ({
      label: this.toText(source['label'], 'Indicateur'),
      value: this.toText(source['value'], String(this.toNumber(source['value'], 0))),
      detail: this.toText(source['detail'], '')
    }));

    return stats.length > 0 ? stats : fallback;
  }

  private toCharts(value: unknown, fallback: DashboardChart[] = []): DashboardChart[] {
    const charts = this.extractArray(value)
      .map((source) => ({
        kind: source['kind'] === 'pie' ? 'pie' : 'bar',
        title: this.toText(source['title'], 'Statistiques'),
        subtitle: this.toText(source['subtitle'], ''),
        unit: this.toOptionalText(source['unit']),
        items: this.extractArray(source['items']).map((item, index) => ({
          label: this.toText(item['label'], `Item ${index + 1}`),
          value: this.toNumber(item['value'], 0),
          detail: this.toOptionalText(item['detail']),
          color: this.toOptionalText(item['color']) ?? this.palette(index)
        }))
      }))
      .filter((chart) => chart.items.length > 0) as DashboardChart[];

    return charts.length > 0 ? charts : fallback.filter((chart) => chart.items.length > 0);
  }

  private toNotifications(value: unknown): DashboardNotification[] {
    return this.extractArray(value).map((source) => ({
      title: this.toText(source['title'] ?? source['titre'], 'Information'),
      description: this.toText(source['description'] ?? source['message'] ?? source['contenu'] ?? source['body'], ''),
      meta: this.toText(source['meta'] ?? source['date'] ?? source['createdAt'], ''),
      isNew:
        source['lue'] === false ||
        source['isNew'] === true ||
        source['priority'] === 'urgent' ||
        this.isRecent(this.toOptionalText(source['createdAt'] ?? source['date']))
    }));
  }

  private toProgress(value: unknown): Array<{ label: string; progress: number; detail: string }> {
    return this.extractArray(value).map((source) => ({
      label: this.toText(source['label'] ?? source['matiere'] ?? source['nom'], 'Progression'),
      progress: this.toNumber(source['progress'] ?? source['score'], 0),
      detail: this.toText(source['detail'], '')
    }));
  }

  private toProgressArray(coursByMatiere: Array<{ matiere: any; cours: any[] }>, completedQuizIds = new Set<number>()) {
    return coursByMatiere.slice(0, 5).map((item) => {
      const totalCours = item.cours.length;
      if (totalCours === 0) {
        return { label: item.matiere.nom, progress: 0, detail: '0/0 cours lu' };
      }
      
      const coursLus = item.cours.filter((cours) => cours.quizId && completedQuizIds.has(cours.quizId)).length;
      
      const progress = Math.round((coursLus / totalCours) * 100);
      
      return {
        label: item.matiere.nom,
        progress: progress,
        detail: `${coursLus}/${totalCours} cours lu(s)`
      };
    });
  }

  private formatCourseMeta(createdAt: string | undefined, author: string): string {
    const datePart = createdAt ? new Date(createdAt).toLocaleDateString('fr-FR') : 'Recemment';
    return `${datePart} - ${author}`;
  }

  private toCourseRecommendations(
    coursByMatiere: Array<{ matiere: any; cours: any[] }>,
    completedQuizIds: Set<number>
  ): DashboardNotification[] {
    return coursByMatiere
      .flatMap((item) =>
        item.cours
          .filter((cours) => !cours.quizId || !completedQuizIds.has(cours.quizId))
          .map((cours) => ({
            title: cours.titre,
            description: cours.quizId ? 'Quiz disponible a terminer.' : 'Support PDF a consulter.',
            meta: item.matiere.nom
          }))
      )
      .slice(0, 4);
  }

  private readLocalQuizResults(): Array<{ quizId: number; score: number; passed: boolean }> {
    try {
      const raw = localStorage.getItem('enipath.quizResults');
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed)
        ? parsed.map((item) => ({
            quizId: this.toNumber(item?.quizId, 0),
            score: this.toNumber(item?.score, 0),
            passed: item?.passed === true
          }))
        : [];
    } catch {
      return [];
    }
  }

  private isRecent(value?: string): boolean {
    if (!value) {
      return false;
    }

    const timestamp = Date.parse(value);
    if (!Number.isFinite(timestamp)) {
      return false;
    }

    return Date.now() - timestamp <= 7 * 24 * 60 * 60 * 1000;
  }

  private toCourseDistribution(coursByMatiere: Array<{ matiere: any; cours: any[] }>) {
    const items = coursByMatiere
      .map((item, index) => ({
        label: item.matiere.nom,
        value: item.cours.length,
        detail: `${item.cours.length} support(s)`,
        color: this.palette(index)
      }))
      .filter((item) => item.value > 0)
      .sort((left, right) => right.value - left.value)
      .slice(0, 7);

    return items.length > 0
      ? items
      : [{ label: 'Aucune donnee', value: 1, detail: 'En attente de cours', color: '#64748b' }];
  }

  private toSemesterDistribution(library: Array<{ semestre: any; matieres: any[] }>) {
    const items = library
      .map((entry, index) => ({
        label: entry.semestre.nom,
        value: entry.matieres.length,
        detail: `${entry.matieres.length} matiere(s)`,
        color: this.palette(index)
      }))
      .filter((item) => item.value > 0);

    return items.length > 0
      ? items
      : [{ label: 'Aucune donnee', value: 1, detail: 'En attente de matieres', color: '#64748b' }];
  }

  private toQuizCoverage(totalCours: number, totalQuiz: number) {
    const items = [
      { label: 'Avec quiz', value: totalQuiz, color: '#38bdf8' },
      { label: 'Sans quiz', value: Math.max(totalCours - totalQuiz, 0), color: '#f97316' }
    ].filter((item) => item.value > 0);

    return items.length > 0
      ? items
      : [{ label: 'Aucune donnee', value: 1, detail: 'En attente de cours', color: '#64748b' }];
  }

  private extractArray(payload: unknown): Record<string, unknown>[] {
    if (Array.isArray(payload)) {
      return payload as Record<string, unknown>[];
    }

    if (!payload || typeof payload !== 'object') {
      return [];
    }

    const source = payload as Record<string, unknown>;
    const candidate = [source['content'], source['items'], source['value'], source['data'], source['results']].find(
      Array.isArray
    );

    return (candidate as Record<string, unknown>[] | undefined) ?? [];
  }

  private extractItem(payload: unknown): Record<string, unknown> {
    if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
      const source = payload as Record<string, unknown>;
      const nested = [source['data'], source['item'], source['result']].find(
        (candidate) => candidate && typeof candidate === 'object' && !Array.isArray(candidate)
      );

      return (nested as Record<string, unknown> | undefined) ?? source;
    }

    return {};
  }

  private average(values: number[]): number {
    const usefulValues = values.filter((value) => Number.isFinite(value));
    if (usefulValues.length === 0) {
      return 0;
    }

    return Math.round(usefulValues.reduce((sum, value) => sum + value, 0) / usefulValues.length);
  }

  private groupLabel(item: { niveau?: number; grp?: string }): string {
    return item.niveau ? `Niveau ${item.niveau} - Groupe ${item.grp ?? '-'}` : `Groupe ${item.grp ?? '-'}`;
  }

  private toText(value: unknown, fallback: string): string {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }

    return typeof value === 'string' && value.trim() ? value.trim() : fallback;
  }

  private toOptionalText(value: unknown): string | undefined {
    return typeof value === 'string' && value.trim() ? value.trim() : undefined;
  }

  private toNumber(value: unknown, fallback: number): number {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : fallback;
  }

  private toOptionalNumber(value: unknown): number | undefined {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : undefined;
  }

  private palette(index: number): string {
    const colors = ['#38bdf8', '#f97316', '#34d399', '#a78bfa', '#facc15', '#fb7185', '#22c55e'];
    return colors[index % colors.length];
  }
}
