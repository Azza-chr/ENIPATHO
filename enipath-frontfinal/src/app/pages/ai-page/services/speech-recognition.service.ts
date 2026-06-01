import { Injectable, inject, signal, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SpeechRecognitionService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBase;
  private readonly zone = inject(NgZone);

  readonly transcript = signal('');
  readonly listening = signal(false);
  readonly transcribing = signal(false);
  readonly supported = signal(
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== 'undefined'
  );

  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private currentMime = '';

  async start(): Promise<void> {
    if (!this.supported()) {
      throw new Error('Audio recording is not supported in this browser.');
    }
    if (this.transcribing()) {
      throw new Error('Still transcribing the previous recording — please wait a moment.');
    }
    if (this.listening()) return;

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      throw new Error('Microphone permission denied.');
    }

    this.currentMime = this.pickMime();
    this.chunks = [];
    this.mediaRecorder = new MediaRecorder(
      this.stream,
      this.currentMime ? { mimeType: this.currentMime } : undefined
    );

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.chunks.push(e.data);
    };
    this.mediaRecorder.onstop = () => {
      void this.uploadAndTranscribe();
    };

    this.transcript.set('');
    this.mediaRecorder.start(250);
    this.listening.set(true);
  }

  stop(): void {
    if (!this.mediaRecorder || !this.listening()) return;

    this.listening.set(false);
    this.transcribing.set(true);

    try {
      this.mediaRecorder.stop();
    } catch {
      this.transcribing.set(false);
    }

    this.stream?.getTracks().forEach(t => t.stop());
    this.stream = null;
  }

  private async uploadAndTranscribe(): Promise<void> {
    this.stream?.getTracks().forEach(t => t.stop());
    this.stream = null;

    if (this.chunks.length === 0) {
      this.zone.run(() => this.transcribing.set(false));
      return;
    }

    try {
      const blob = new Blob(this.chunks, { type: this.currentMime || 'audio/webm' });
      const ext = this.currentMime.includes('mp4') ? 'm4a'
                : this.currentMime.includes('ogg') ? 'ogg'
                : 'webm';
      const file = new File([blob], `recording.${ext}`, { type: blob.type });

      const form = new FormData();
      form.append('audio', file);

      const res = await firstValueFrom(
        this.http.post<{ transcript: string }>(`${this.base}/transcribe`, form)
      );

      this.zone.run(() => this.transcript.set(res.transcript || ''));
    } catch (e: any) {
      const msg = e?.error?.message || e?.message || 'Transcription failed.';
      this.zone.run(() => this.transcript.set(''));
      console.error('Transcription error:', msg);
    } finally {
      this.chunks = [];
      this.zone.run(() => this.transcribing.set(false));
    }
  }

  private pickMime(): string {
    const candidates = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
      ''
    ];
    for (const c of candidates) {
      if (!c || MediaRecorder.isTypeSupported(c)) return c;
    }
    return '';
  }
}