// Role: authenticated profile page for all roles, connected to user data and account actions.
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { UserProfile } from '../../models/auth.models';
import { AuthService } from '../../services/auth.service';
import { UserProfileService } from '../../services/user-profile.service';

@Component({
  selector: 'app-student-profile-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-profile-page.component.html',
  styleUrl: './student-profile-page.component.css'
})
export class StudentProfilePageComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly profileService = inject(UserProfileService);

  profile: UserProfile | null = null;
  isLoading = true;
  isSavingPassword = false;
  isUploadingPhoto = false;
  message = '';
  errorMessage = '';
  isSavingProfile = false;
  isUploadingCv = false;

  personalData = {
    bio: '',
    phone: '',
    address: '',
    linkedin: '',
    github: '',
    portfolio: '',
    skills: '',
    cvUrl: '',
    cvFileName: '',
    shareCv: false
  };

  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  showPasswordModal = false;

  openPasswordModal(): void {
    this.showPasswordModal = true;
    this.message = '';
    this.errorMessage = '';
  }

  closePasswordModal(): void {
    this.showPasswordModal = false;
    this.passwordForm = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    this.message = '';
    this.errorMessage = '';
  }

  ngOnInit(): void {
    this.profileService.getCurrentProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        this.personalData = { ...this.personalData, ...(profile as any), ...this.restorePersonalData(profile.email) };
        this.isLoading = false;
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
        this.isLoading = false;
      }
    });
  }

  get initials(): string {
    return (this.profile?.fullName ?? 'EN')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  }

  get roleLabel(): string {
    const labels = {
      etudiant: 'Etudiant',
      enseignant: 'Enseignant',
      'chef-departement': 'Chef de departement'
    };

    return this.profile ? labels[this.profile.role] : '';
  }

  get completionScore(): number {
    const fields = [
      this.profile?.photoUrl,
      this.personalData.bio,
      this.personalData.phone,
      this.personalData.address,
      this.personalData.linkedin,
      this.personalData.github,
      this.personalData.portfolio,
      this.personalData.skills,
      this.personalData.cvUrl
    ];
    const completed = fields.filter((value) => String(value ?? '').trim().length > 0).length;

    return Math.round((completed / fields.length) * 100);
  }

  get skillsList(): string[] {
    return this.personalData.skills
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean)
      .slice(0, 8);
  }

  get roleFocus(): Array<{ label: string; value: string }> {
    if (!this.profile) {
      return [];
    }

    if (this.profile.role === 'etudiant') {
      return [
        { label: 'Parcours', value: `Niveau ${this.profile.niveau ?? '-'} - Groupe ${this.profile.grp ?? '-'}` },
        { label: 'Objectif', value: 'Apprendre, pratiquer, valider les quiz' },
        { label: 'Visibilite', value: this.personalData.shareCv ? 'CV partage' : 'CV prive' }
      ];
    }

    if (this.profile.role === 'enseignant') {
      return [
        { label: 'Departement', value: this.profile.departement ?? 'Informatique' },
        { label: 'Specialite', value: this.profile.specialite ?? 'Pedagogie numerique' },
        { label: 'Mission', value: 'Publier les cours et accompagner les groupes' }
      ];
    }

    return [
      { label: 'Departement', value: this.profile.departement ?? 'Informatique' },
      { label: 'Mission', value: 'Superviser les echanges et les reclamations' },
      { label: 'Priorite', value: 'Clarifier le suivi academique' }
    ];
  }

  get publicLinks(): Array<{ label: string; value: string }> {
    return [
      { label: 'LinkedIn', value: this.personalData.linkedin },
      { label: 'GitHub', value: this.personalData.github },
      { label: 'Portfolio', value: this.personalData.portfolio }
    ].filter((link) => link.value?.trim());
  }

  get passwordStrengthLabel(): string {
    const value = this.passwordForm.newPassword;
    let score = 0;
    if (value.length >= 6) score += 1;
    if (value.length >= 10) score += 1;
    if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
    if (/\d/.test(value)) score += 1;
    if (/[^A-Za-z0-9]/.test(value)) score += 1;

    if (!value) return 'non renseignee';
    if (score <= 2) return 'faible';
    if (score <= 4) return 'correcte';
    return 'forte';
  }

  get passwordStrengthPercent(): number {
    const value = this.passwordForm.newPassword;
    let score = 0;
    if (value.length >= 6) score += 1;
    if (value.length >= 10) score += 1;
    if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
    if (/\d/.test(value)) score += 1;
    if (/[^A-Za-z0-9]/.test(value)) score += 1;

    return Math.min(100, score * 20);
  }

  get passwordHasLength(): boolean {
    return this.passwordForm.newPassword.length >= 6;
  }

  get passwordIsNotDefault(): boolean {
    return this.passwordForm.newPassword !== '123456' && this.passwordForm.newPassword.length > 0;
  }

  get passwordHasComplexity(): boolean {
    const value = this.passwordForm.newPassword;
    return /[A-Za-z]/.test(value) && /\d/.test(value);
  }

  get passwordConfirmationMatches(): boolean {
    return Boolean(this.passwordForm.confirmPassword) && this.passwordForm.newPassword === this.passwordForm.confirmPassword;
  }

  get sessionExpiryLabel(): string {
    const expiresAt = this.auth.session?.expiresAt;
    if (!expiresAt) {
      return 'Session active';
    }

    return new Date(expiresAt).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  get securityItems(): Array<{ label: string; title: string; detail: string; status: string }> {
    return [
      {
        label: 'Role',
        title: 'Acces limite a votre espace',
        detail: `Votre session ouvre uniquement les pages ${this.roleLabel.toLowerCase()} autorisees par le guard Angular.`,
        status: 'Actif'
      },
      {
        label: 'Navigation',
        title: 'Retour vers l espace etudiant',
        detail: 'La deconnexion renvoie vers l espace etudiant et les espaces restent accessibles directement.',
        status: 'Protege'
      },
      {
        label: 'Session',
        title: `Expiration : ${this.sessionExpiryLabel}`,
        detail: 'La session locale expire automatiquement et les donnees sont nettoyees au prochain chargement.',
        status: 'Surveille'
      }
    ];
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'Choisissez une image depuis votre PC.';
      return;
    }

    this.isUploadingPhoto = true;
    this.message = '';
    this.errorMessage = '';

    this.profileService.uploadPhoto(file).subscribe({
      next: (photoUrl) => {
        if (this.profile) {
          this.profile = { ...this.profile, photoUrl };
        }
        this.message = 'Photo de profil mise a jour.';
        this.isUploadingPhoto = false;
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
        this.isUploadingPhoto = false;
      }
    });
  }

  onCvSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      this.errorMessage = 'Le CV doit être un fichier PDF.';
      return;
    }

    this.isUploadingCv = true;
    this.message = '';
    this.errorMessage = '';

    const reader = new FileReader();
    reader.onload = () => {
      this.personalData.cvUrl = String(reader.result ?? '');
      this.personalData.cvFileName = file.name;
      this.personalData.shareCv = true;
      this.savePersonalData(false);
      this.message = 'CV mis a jour et pret a etre partage.';
      this.isUploadingCv = false;
    };
    reader.onerror = () => {
      this.errorMessage = 'Lecture du CV impossible.';
      this.isUploadingCv = false;
    };
    reader.readAsDataURL(file);
  }

  savePersonalData(showMessage = true): void {
    this.isSavingProfile = true;
    this.message = '';
    this.errorMessage = '';

    localStorage.setItem(this.personalDataKey(), JSON.stringify(this.personalData));
    if (showMessage) {
      this.message = 'Donnees personnelles enregistrees avec succes.';
    }
    this.isSavingProfile = false;
  }

  changePassword(): void {
    this.message = '';
    this.errorMessage = '';

    if (this.passwordForm.newPassword.length < 6) {
      this.errorMessage = 'Le nouveau mot de passe doit contenir au moins 6 caracteres.';
      return;
    }

    if (this.passwordForm.newPassword === '123456') {
      this.errorMessage = 'Choisissez un mot de passe different du mot de passe par defaut.';
      return;
    }

    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.errorMessage = 'La confirmation du mot de passe ne correspond pas.';
      return;
    }

    this.isSavingPassword = true;
    this.profileService
      .changePassword(this.passwordForm.currentPassword, this.passwordForm.newPassword)
      .subscribe({
        next: () => {
          this.passwordForm = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          };
          this.message = 'Mot de passe modifie avec succes.';
          this.isSavingPassword = false;
        },
        error: (error: Error) => {
          this.errorMessage = error.message;
          this.isSavingPassword = false;
        }
      });
  }

  logout(): void {
    const confirmed = window.confirm('Voulez-vous vraiment vous deconnecter ?');
    if (confirmed) {
      this.auth.logout();
    }
  }

  private restorePersonalData(email: string) {
    const raw = localStorage.getItem(this.personalDataKey(email));
    if (!raw) {
      return {};
    }

    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }

  private personalDataKey(email = this.profile?.email ?? this.auth.session?.email ?? 'local'): string {
    return `enipath.personalProfile.${email}`;
  }
}
