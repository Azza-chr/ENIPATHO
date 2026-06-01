import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiLandingApiService } from './services/ai-landing-api.service';
import { SpeechRecognitionService } from './services/speech-recognition.service';
import { OcrResponse, QuizResponse, SpeechResponse } from './models/ai-landing.models';

@Component({
  selector: 'app-ai-landing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-landing.component.html',
  styleUrls: ['./ai-landing.component.scss']
})
export class AiLandingComponent {
  private readonly api = inject(AiLandingApiService);
  readonly speech = inject(SpeechRecognitionService);

  readonly speechAnswer = signal<SpeechResponse | null>(null);
  readonly speechLoading = signal(false);
  readonly speechError = signal<string | null>(null);

  readonly imagePreview = signal<string | null>(null);
  readonly imageFile = signal<File | null>(null);
  readonly ocrResult = signal<OcrResponse | null>(null);
  readonly ocrLoading = signal(false);
  readonly ocrError = signal<string | null>(null);

  quizSource = '';
  quizCount = 5;
  readonly quiz = signal<QuizResponse | null>(null);
  readonly quizLoading = signal(false);
  readonly quizError = signal<string | null>(null);
  readonly selectedAnswers = signal<Record<number, number>>({});
  readonly score = computed(() => {
    const q = this.quiz();
    if (!q) return 0;
    const sel = this.selectedAnswers();
    return q.questions.reduce((s, qq, i) => s + (sel[i] === qq.correctIndex ? 1 : 0), 0);
  });

async toggleListening(): Promise<void> {
  this.speechError.set(null);
  if (this.speech.listening()) {
    this.speech.stop();
    return;
  }
  try {
    await this.speech.start();
  } catch (e: any) {
    this.speechError.set(e.message);
  }
}

  submitSpeech(): void {
    const t = this.speech.transcript().trim();
    if (!t) { this.speechError.set('Please record a question first.'); return; }
    this.speechLoading.set(true);
    this.speechError.set(null);
    this.speechAnswer.set(null);
    this.api.ask({ transcript: t }).subscribe({
      next: r => { this.speechAnswer.set(r); this.speechLoading.set(false); },
      error: e => { this.speechError.set(e.message); this.speechLoading.set(false); }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.ocrError.set('Please select an image file.'); return;
    }
    this.imageFile.set(file);
    this.ocrError.set(null);
    this.ocrResult.set(null);
    const reader = new FileReader();
    reader.onload = () => this.imagePreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  submitOcr(): void {
    const f = this.imageFile();
    if (!f) { this.ocrError.set('Please choose an image.'); return; }
    this.ocrLoading.set(true);
    this.ocrError.set(null);
    this.api.ocr(f).subscribe({
      next: r => { this.ocrResult.set(r); this.ocrLoading.set(false); },
      error: e => { this.ocrError.set(e.message); this.ocrLoading.set(false); }
    });
  }

  submitQuiz(): void {
    const source = this.quizSource.trim();
    if (!source) { this.quizError.set('Enter source text.'); return; }
    this.quizLoading.set(true);
    this.quizError.set(null);
    this.quiz.set(null);
    this.selectedAnswers.set({});
    this.api.quiz({ sourceText: source, numQuestions: this.quizCount }).subscribe({
      next: r => { this.quiz.set(r); this.quizLoading.set(false); },
      error: e => { this.quizError.set(e.message); this.quizLoading.set(false); }
    });
  }

  pickAnswer(qIndex: number, optIndex: number): void {
    this.selectedAnswers.update(s => ({ ...s, [qIndex]: optIndex }));
  }
}
