// Role: handles the global dark/light theme state across the whole application.
import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type AppTheme = 'dark' | 'light';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private static readonly storageKey = 'enipath.theme';

  private readonly document = inject(DOCUMENT);
  private readonly themeSubject = new BehaviorSubject<AppTheme>(this.restoreTheme());
  readonly theme$ = this.themeSubject.asObservable();

  get theme(): AppTheme {
    return this.themeSubject.value;
  }

  initialize(): void {
    this.applyTheme(this.themeSubject.value);
  }

  toggleTheme(): void {
    this.setTheme(this.theme === 'dark' ? 'light' : 'dark');
  }

  setTheme(theme: AppTheme): void {
    localStorage.setItem(ThemeService.storageKey, theme);
    this.themeSubject.next(theme);
    this.applyTheme(theme);
  }

  private restoreTheme(): AppTheme {
    return localStorage.getItem(ThemeService.storageKey) === 'dark' ? 'dark' : 'light';
  }

  private applyTheme(theme: AppTheme): void {
    this.document.documentElement.setAttribute('data-theme', theme);
  }
}
