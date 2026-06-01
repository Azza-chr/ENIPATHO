import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, retry, throwError, timer } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  SpeechRequest, SpeechResponse,
  OcrResponse, QuizRequest, QuizResponse
} from '../models/ai-landing.models';

@Injectable({ providedIn: 'root' })
export class AiLandingApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBase;

  ask(req: SpeechRequest): Observable<SpeechResponse> {
    return this.http.post<SpeechResponse>(`${this.base}/ask`, req)
      .pipe(this.retryPolicy<SpeechResponse>(), catchError(this.mapError));
  }

  ocr(file: File): Observable<OcrResponse> {
    const form = new FormData();
    form.append('image', file);
    return this.http.post<OcrResponse>(`${this.base}/ocr`, form)
      .pipe(this.retryPolicy<OcrResponse>(), catchError(this.mapError));
  }

  quiz(req: QuizRequest): Observable<QuizResponse> {
    return this.http.post<QuizResponse>(`${this.base}/quiz`, req)
      .pipe(this.retryPolicy<QuizResponse>(), catchError(this.mapError));
  }

  private retryPolicy<T>() {
    return retry<T>({
      count: 2,
      delay: (_err, attempt) => timer(Math.min(500 * 2 ** attempt, 4000))
    });
  }

  private mapError = (err: HttpErrorResponse) => {
    const message = err?.error?.message || err.message || 'Request failed.';
    return throwError(() => ({ message } as { message: string }));
  };
}