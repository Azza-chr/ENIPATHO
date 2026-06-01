// Role: teacher course publishing page used inside the teacher shell.
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { CoursPdf, Groupe, Matiere } from '../../models/catalog.models';
import { CatalogApiService } from '../../services/catalog-api.service';
import { QuizApiService } from '../../services/quiz-api.service';
import { CreateQuestionPayload, TeacherApiService } from '../../services/teacher-api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-teacher-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './teacher-page.component.html',
  styleUrl: './teacher-page.component.css'
})
export class TeacherPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly catalogApi = inject(CatalogApiService);
  private readonly teacherApi = inject(TeacherApiService);
  private readonly quizApi = inject(QuizApiService);
  private readonly authService = inject(AuthService);

  groupes: Groupe[] = [];
  cours: CoursPdf[] = [];
  matieres: Matiere[] = []; // ✅ liste des matières pour le sélecteur
  quizQuestionCountByCourseId: Record<number, number> = {};
  isLoading = true;
  isPublishingCourse = false;
  isPublishingQuiz = false;
  deletingCourseId: number | null = null;
  deletingQuizId: number | null = null;
  feedbackMessage = '';
  feedbackType: 'success' | 'error' | '' = '';
  selectedPdfFile: File | null = null;
  selectedPdfName = '';

  readonly courseForm = this.fb.group({
    groupeId: [0, [Validators.required, Validators.min(1)]],
    matiereId: [0], // ✅ optionnel — 0 = aucune matière sélectionnée
    titre: ['', [Validators.required, Validators.minLength(3)]],
    description: ['']
  });

  readonly quizForm = this.fb.group({
    coursId: [0, [Validators.required, Validators.min(1)]],
    quizTitre: ['Quiz du cours', [Validators.required, Validators.minLength(3)]],
    quizDescription: [''],
    durationMinutes: [15, [Validators.required, Validators.min(1)]],
    passingScore: [60, [Validators.required, Validators.min(0)]],
    questions: this.fb.array([this.createQuestionForm()])
  });

  ngOnInit(): void {
    this.loadWorkspace();
  }

  get questions(): FormArray {
    return this.quizForm.get('questions') as FormArray;
  }

  get selectedCourse(): CoursPdf | undefined {
    const coursId = Number(this.quizForm.value.coursId ?? 0);
    return this.cours.find((course) => course.id === coursId);
  }

  get canPublishQuiz(): boolean {
    return !!this.selectedCourse && (!this.selectedCourse.quizId || this.isEmptyQuiz(this.selectedCourse));
  }

  selectCourseForQuiz(course: CoursPdf): void {
    this.quizForm.patchValue({
      coursId: course.id,
      quizTitre: `Quiz - ${course.titre}`
    });

    if (course.quizId) {
      if (this.isEmptyQuiz(course)) {
        this.setFeedback('error', 'Ce cours contient un quiz vide. Republier le quiz remplacera automatiquement ce brouillon vide.');
      } else {
        this.setFeedback('error', 'Ce cours a deja un quiz complet. Supprime le quiz existant avant d en creer un nouveau.');
      }
      return;
    }

    this.resetFeedback();
  }

  addQuestion(): void {
    this.questions.push(this.createQuestionForm());
  }

  removeQuestion(index: number): void {
    if (this.questions.length === 1) {
      return;
    }

    this.questions.removeAt(index);
  }

  onPdfSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedPdfFile = null;
    this.selectedPdfName = '';

    if (!file) {
      return;
    }

    if (file.type !== 'application/pdf') {
      alert('Erreur : Selectionne uniquement un fichier PDF.');
      return;
    }

    this.selectedPdfFile = file;
    this.selectedPdfName = file.name;
    this.courseForm.patchValue({
      titre: this.courseForm.value.titre || file.name.replace(/\.pdf$/i, '')
    });
  }

  async publishCourse(): Promise<void> {
    if (this.courseForm.invalid || !this.selectedPdfFile) {
      this.courseForm.markAllAsTouched();
      if (!this.selectedPdfFile) {
        alert('Erreur : Ajoute un PDF avant de publier le cours.');
        return;
      }
      alert('Erreur : Complete correctement le titre et le groupe avant de publier le cours.');
      return;
    }

    this.resetFeedback();
    this.isPublishingCourse = true;

    try {
      const value = this.courseForm.getRawValue();
      const enseignantId = this.authService.session?.id ?? 0;

      if (!enseignantId) {
        throw new Error('Identifiant enseignant introuvable.');
      }

      const matiereId = Number(value.matiereId ?? 0);

      const uploadedCourse = (await firstValueFrom(
        this.teacherApi.uploadCourse(enseignantId, Number(value.groupeId), {
          titre: value.titre ?? '',
          description: value.description ?? '',
          pdf: this.selectedPdfFile,
          matiereId: matiereId > 0 ? matiereId : undefined // ✅ passer matiereId si sélectionné
        })
      )) as unknown;

      const courseId = this.extractNumericId(uploadedCourse);

      if (courseId <= 0) {
        throw new Error(
          'Le serveur a repondu mais n a pas fourni l ID du cours. Verifie que ton backend retourne le champ "id" ou "courseId".'
        );
      }

      await this.refreshCours(courseId);
      if (courseId > 0) {
        this.quizForm.patchValue({
          coursId: courseId,
          quizTitre: value.titre ? `Quiz - ${value.titre}` : 'Quiz du cours'
        });
      }

      this.selectedPdfFile = null;
      this.selectedPdfName = '';
      this.courseForm.patchValue({
        titre: '',
        description: '',
        matiereId: 0
      });

      const matiereName = matiereId > 0
        ? (this.matieres.find(m => m.id === matiereId)?.nom ?? '')
        : '';
      const matiereInfo = matiereName ? ` et lié à la matière "${matiereName}"` : ' (sans matière associée)';
      this.setFeedback('success', `Le cours PDF a bien ete partage au groupe choisi${matiereInfo}. Il doit maintenant apparaitre cote etudiant.`);
    } catch (error) {
      alert('Erreur : ' + this.readApiError(error, 'Le partage du cours PDF a echoue.'));
    } finally {
      this.isPublishingCourse = false;
    }
  }

  async publishQuiz(): Promise<void> {
    if (!this.selectedCourse) {
      this.setFeedback('error', 'Choisis d abord un cours dans la liste des cours deja partages.');
      return;
    }

    if (this.quizForm.invalid) {
      this.quizForm.markAllAsTouched();
      this.setFeedback('error', 'Complete tous les champs du quiz et de ses questions avant de publier.');
      return;
    }

    this.resetFeedback();
    this.isPublishingQuiz = true;
    let createdQuizId = 0;

    try {
      const value = this.quizForm.getRawValue();
      const coursId = Number(value.coursId ?? 0);
      const selectedCourse = this.cours.find((course) => course.id === coursId);

      if (selectedCourse?.quizId && this.isEmptyQuiz(selectedCourse)) {
        await firstValueFrom(this.teacherApi.deleteQuiz(selectedCourse.quizId));
        await this.refreshCours(coursId);
      } else if (selectedCourse?.quizId) {
        this.setFeedback('error', 'Le cours selectionne possede deja un quiz complet.');
        return;
      }

      const createdQuiz = (await firstValueFrom(
        this.teacherApi.createCourseQuiz(coursId, {
          titre: value.quizTitre ?? '',
          description: (value.quizDescription ?? '').trim(),
          durationMinutes: Number(value.durationMinutes ?? 15),
          passingScore: Number(value.passingScore ?? 60)
        })
      )) as unknown;

      createdQuizId = this.extractNumericId(createdQuiz);
      if (!createdQuizId) {
        throw new Error('Quiz non cree');
      }

      for (const [index, question] of (value.questions ?? []).entries()) {
        await firstValueFrom(this.teacherApi.createQuestion(createdQuizId, this.buildQuestionPayload(question, index)));
      }

      await this.refreshCours(coursId);
      this.quizForm.patchValue({
        coursId,
        quizTitre: 'Quiz du cours',
        quizDescription: '',
        durationMinutes: 15,
        passingScore: 60
      });
      this.questions.clear();
      this.questions.push(this.createQuestionForm());
      this.setFeedback('success', 'Le quiz a bien ete ajoute au cours choisi.');
    } catch (error) {
      if (createdQuizId > 0) {
        await this.safeRollbackQuiz(createdQuizId, Number(this.quizForm.value.coursId ?? 0));
      }

      this.setFeedback(
        'error',
        this.readApiError(
          error,
          'La publication du quiz a echoue. Le brouillon de quiz a ete retire automatiquement pour ne pas bloquer le cours.'
        )
      );
    } finally {
      this.isPublishingQuiz = false;
    }
  }

  async deleteCourse(course: CoursPdf): Promise<void> {
    this.resetFeedback();
    this.deletingCourseId = course.id;

    try {
      await firstValueFrom(this.teacherApi.deleteCourse(course.id));
      await this.refreshCours();
      if (Number(this.quizForm.value.coursId ?? 0) === course.id) {
        this.quizForm.patchValue({ coursId: this.pickDefaultCourseId(this.cours) });
      }
      this.setFeedback('success', 'Le cours a bien ete supprime.');
    } catch (error) {
      this.setFeedback('error', this.readApiError(error, 'La suppression du cours a echoue.'));
    } finally {
      this.deletingCourseId = null;
    }
  }

  async deleteQuiz(course: CoursPdf): Promise<void> {
    if (!course.quizId) {
      return;
    }

    this.resetFeedback();
    this.deletingQuizId = course.quizId;

    try {
      await firstValueFrom(this.teacherApi.deleteQuiz(course.quizId));
      await this.refreshCours(course.id);
      this.setFeedback('success', 'Le quiz du cours a bien ete supprime.');
    } catch (error) {
      this.setFeedback('error', this.readApiError(error, 'La suppression du quiz a echoue.'));
    } finally {
      this.deletingQuizId = null;
    }
  }

  private loadWorkspace(): void {
    const enseignantId = this.authService.session?.id ?? 0;
    if (!enseignantId) {
      this.groupes = this.fallbackGroupes();
      this.courseForm.patchValue({ groupeId: this.groupes[0]?.id ?? 0 });
      this.isLoading = false;
      return;
    }

    Promise.all([
      firstValueFrom(this.catalogApi.getGroupes()).catch(() => this.fallbackGroupes()),
      firstValueFrom(this.catalogApi.getCoursByEnseignant(enseignantId)).catch(() => []),
      firstValueFrom(this.catalogApi.getMatieres()).catch(() => []) // ✅ charger les matières
    ])
      .then(async ([groupes, cours, matieres]) => {
        this.groupes = groupes.length > 0 ? groupes : this.fallbackGroupes();
        this.courseForm.patchValue({ groupeId: this.groupes[0]?.id ?? 0 });
        this.cours = cours;
        this.matieres = matieres; // ✅ stocker les matières
        await this.refreshQuizStates(this.cours);
        this.quizForm.patchValue({ coursId: this.pickDefaultCourseId(this.cours) });
      })
      .catch(() => {
        this.groupes = this.fallbackGroupes();
        this.courseForm.patchValue({ groupeId: this.groupes[0]?.id ?? 0 });
        this.setFeedback('error', 'Impossible de charger toutes les donnees enseignant. Vous pouvez quand meme preparer un cours.');
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  private async refreshCours(preferredCourseId?: number): Promise<void> {
    const enseignantId = this.authService.session?.id ?? 0;
    if (!enseignantId) {
      return;
    }

    this.cours = await firstValueFrom(this.catalogApi.getCoursByEnseignant(enseignantId));
    await this.refreshQuizStates(this.cours);
    this.quizForm.patchValue({ coursId: this.pickDefaultCourseId(this.cours, preferredCourseId) });
  }

  private fallbackGroupes(): Groupe[] {
    return ['A', 'B', 'C', 'D'].map((nom, index) => ({
      id: index + 1,
      nom,
      niveau: '1',
      filiere: this.authService.session?.departement ?? 'Informatique'
    }));
  }

  private createQuestionForm() {
    return this.fb.group({
      label: ['', [Validators.required, Validators.minLength(5)]],
      explication: [''],
      points: [1, [Validators.required, Validators.min(1)]],
      optionA: ['', [Validators.required]],
      optionB: ['', [Validators.required]],
      optionC: ['', [Validators.required]],
      optionD: ['', [Validators.required]],
      correctOption: ['A', [Validators.required]]
    });
  }

  private buildQuestionPayload(question: any, index: number): CreateQuestionPayload {
    const correctOption = question.correctOption ?? 'A';

    return {
      enonce: question.label ?? '',
      explication: (question.explication ?? '').trim(),
      ordre: index + 1,
      points: Number(question.points ?? 1),
      choices: [
        { label: question.optionA ?? '', ordre: 1, correct: correctOption === 'A' },
        { label: question.optionB ?? '', ordre: 2, correct: correctOption === 'B' },
        { label: question.optionC ?? '', ordre: 3, correct: correctOption === 'C' },
        { label: question.optionD ?? '', ordre: 4, correct: correctOption === 'D' }
      ]
    };
  }

  private setFeedback(type: 'success' | 'error', message: string): void {
    this.feedbackType = type;
    this.feedbackMessage = message;
  }

  getQuizBadge(course: CoursPdf): string {
    if (!course.quizId) {
      return 'Sans quiz';
    }

    if (this.isEmptyQuiz(course)) {
      return 'Quiz vide';
    }

    return 'Quiz present';
  }

  isEmptyQuiz(course: CoursPdf): boolean {
    return Boolean(course.quizId) && this.quizQuestionCountByCourseId[course.id] === 0;
  }

  private pickDefaultCourseId(cours: CoursPdf[], preferredCourseId?: number): number {
    if (preferredCourseId && cours.some((course) => course.id === preferredCourseId)) {
      return preferredCourseId;
    }

    const courseWithoutQuiz = cours.find((course) => !course.quizId);
    return courseWithoutQuiz?.id ?? cours[0]?.id ?? 0;
  }

  private extractNumericId(payload: unknown): number {
    let source: Record<string, unknown>;

    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return 0;
    }

    source = payload as Record<string, unknown>;

    const nested = [source['data'], source['item'], source['result'], source['value']].find(
      (candidate) => candidate && typeof candidate === 'object' && !Array.isArray(candidate)
    ) as Record<string, unknown> | undefined;

    const dataObject = nested ?? source;

    const id =
      dataObject['id'] ??
      dataObject['courseId'] ??
      dataObject['coursId'] ??
      dataObject['resourceId'] ??
      0;

    return Number(id);
  }

  private async refreshQuizStates(cours: CoursPdf[]): Promise<void> {
    const states = await Promise.all(
      cours.map(async (course) => {
        if (!course.quizId) {
          return [course.id, -1] as const;
        }

        try {
          const quiz = await firstValueFrom(this.quizApi.getQuizById(course.quizId));
          return [course.id, quiz.questions.length] as const;
        } catch {
          return [course.id, -1] as const;
        }
      })
    );

    this.quizQuestionCountByCourseId = Object.fromEntries(states);
  }

  private async safeRollbackQuiz(quizId: number, coursId: number): Promise<void> {
    try {
      await firstValueFrom(this.teacherApi.deleteQuiz(quizId));
    } catch {
      // Ignore rollback failure to preserve the original error message.
    }

    await this.refreshCours(coursId);
  }

  private readApiError(error: unknown, fallback: string): string {
    if (!(error instanceof HttpErrorResponse)) {
      return fallback;
    }

    const apiMessage = this.extractErrorMessage(error.error);
    return apiMessage || error.message || fallback;
  }

  private extractErrorMessage(payload: unknown): string {
    if (typeof payload === 'string' && payload.trim()) {
      return payload.trim();
    }

    if (!payload || typeof payload !== 'object') {
      return '';
    }

    const source = payload as Record<string, unknown>;
    const direct = [source['message'], source['error'], source['detail']].find(
      (value) => typeof value === 'string' && value.trim()
    );

    if (typeof direct === 'string') {
      return direct.trim();
    }

    return '';
  }

  private resetFeedback(): void {
    this.feedbackType = '';
    this.feedbackMessage = '';
  }
}