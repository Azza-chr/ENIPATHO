// Role: shared shell used by student, teacher and department spaces with role-based navigation.
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AppRole, ShellNavItem } from '../../models/auth.models';
import { AuthService } from '../../services/auth.service';
import { CommunicationService } from '../../services/communication.service';
import { ThemeService } from '../../services/theme.service';

type DirectoryProfile = {
  name: string;
  email: string;
  role: AppRole;
  subtitle: string;
  bio: string;
  photoUrl: string;
  skills: string[];
  cvUrl?: string;
  cvFileName?: string;
  shareCv?: boolean;
};

@Component({
  selector: 'app-role-shell',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './role-shell.component.html',
  styleUrl: './role-shell.component.css'
})
export class RoleShellComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);
  private readonly themeService = inject(ThemeService);
  private readonly communication = inject(CommunicationService);

  readonly logoUrl = 'logo-enipath.png';
  searchQuery = '';
  selectedProfile: DirectoryProfile | null = null;

  ngOnInit(): void {
    this.auth.activateRole(this.route.snapshot.data['role'] as AppRole);

    // ✅ Connexion WebSocket dès que le shell est chargé
    const session = this.auth.session;
    if (session) {
      this.communication.connect(session);
    }
  }

  ngOnDestroy(): void {
    // ✅ Déconnexion WebSocket quand on quitte le shell
    this.communication.disconnect();
  }

  get title(): string {
    return this.route.snapshot.data['shellTitle'] as string;
  }

  get subtitle(): string {
    return this.route.snapshot.data['shellSubtitle'] as string;
  }

  get navItems(): ShellNavItem[] {
    return (this.route.snapshot.data['navItems'] as ShellNavItem[]) ?? [];
  }

  get homeLink(): string {
    return this.route.snapshot.data['homeLink'] as string;
  }

  get session() {
    return this.auth.session;
  }

  get currentThemeLabel(): string {
    return this.themeService.theme === 'dark' ? 'Clair' : 'Sombre';
  }

  get filteredProfiles(): DirectoryProfile[] {
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) {
      return [];
    }

    return this.directoryProfiles
      .filter((profile) => profile.email !== this.session?.email)
      .filter((profile) => {
        const haystack = `${profile.name} ${profile.email} ${this.roleLabel(profile.role)} ${profile.subtitle} ${profile.bio}`.toLowerCase();
        return haystack.includes(query);
      })
      .slice(0, 6);
  }

  get directoryProfiles(): DirectoryProfile[] {
    return this.seedProfiles.map((profile) => this.withStoredProfileData(profile));
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  logout(): void {
    const confirmed = window.confirm('Voulez-vous vraiment vous deconnecter ?');
    if (confirmed) {
      this.communication.disconnect();
      this.auth.logout();
    }
  }

  showAboutModal = false;
  showContactModal = false;
  contactMessage = '';
  contactRequest = this.emptyContactRequest();

  openAboutModal(event: Event): void {
    event.preventDefault();
    this.showAboutModal = true;
  }

  closeAboutModal(): void {
    this.showAboutModal = false;
  }

  openContactModal(): void {
    this.showContactModal = true;
    this.contactMessage = '';
  }

  closeContactModal(): void {
    this.showContactModal = false;
    this.contactMessage = '';
  }

  openProfilePreview(profile: DirectoryProfile): void {
    this.selectedProfile = profile;
    this.searchQuery = '';
  }

  closeProfilePreview(): void {
    this.selectedProfile = null;
  }

  initials(value: string): string {
    return value
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  }

  roleLabel(role: AppRole): string {
    const labels: Record<AppRole, string> = {
      etudiant: 'Etudiant',
      enseignant: 'Enseignant',
      'chef-departement': 'Chef departement'
    };

    return labels[role];
  }

  submitContactRequest(): void {
    const subject = this.contactRequest.subject.trim();
    const description = this.contactRequest.description.trim();
    if (!subject || !description) {
      this.contactMessage = 'Merci de remplir l objet et la description.';
      return;
    }

    const key = 'enipath.technicalClaims';
    const raw = localStorage.getItem(key);
    const current = raw ? JSON.parse(raw) as unknown[] : [];
    const next = [
      {
        id: crypto.randomUUID(),
        ...this.contactRequest,
        subject,
        description,
        requester: this.session?.fullName ?? 'Utilisateur',
        email: this.session?.email ?? '',
        role: this.session?.role ?? '',
        destination: 'Support technique ENIPATH',
        storage: key,
        createdAt: new Date().toISOString()
      },
      ...current
    ];

    localStorage.setItem(key, JSON.stringify(next));
    this.contactRequest = this.emptyContactRequest();
    this.contactMessage = 'Reclamation envoyee. Notre equipe technique va la traiter.';
  }

  private emptyContactRequest() {
    return {
      category: 'connexion',
      priority: 'normale',
      subject: '',
      description: ''
    };
  }

  private withStoredProfileData(profile: DirectoryProfile): DirectoryProfile {
    const raw = localStorage.getItem(`enipath.personalProfile.${profile.email}`);
    if (!raw) {
      return profile;
    }

    try {
      const stored = JSON.parse(raw) as Partial<{
        bio: string;
        skills: string;
        cvUrl: string;
        cvFileName: string;
        shareCv: boolean;
      }>;

      return {
        ...profile,
        bio: stored.bio?.trim() || profile.bio,
        skills: stored.skills
          ? stored.skills.split(',').map((skill) => skill.trim()).filter(Boolean).slice(0, 6)
          : profile.skills,
        cvUrl: stored.shareCv ? stored.cvUrl : undefined,
        cvFileName: stored.shareCv ? stored.cvFileName : undefined,
        shareCv: Boolean(stored.shareCv)
      };
    } catch {
      return profile;
    }
  }

  private readonly seedProfiles: DirectoryProfile[] = [
    {
      name: 'Youssef Gharbi',
      email: 'youssef.gharbi@etudiant.enipath.tn',
      role: 'etudiant',
      subtitle: 'Niveau 1 - Groupe A',
      bio: 'Etudiant motive par Java, algorithmique et bases de donnees.',
      photoUrl: 'app/image/2.jpg',
      skills: ['Java', 'Algorithmique', 'SQL']
    },
    {
      name: 'Fatma Jlassi',
      email: 'fatma.jlassi@etudiant.enipath.tn',
      role: 'etudiant',
      subtitle: 'Niveau 1 - Groupe A',
      bio: 'Profil oriente developpement web, travail en equipe et progression continue.',
      photoUrl: 'app/image/3.jpg',
      skills: ['HTML', 'CSS', 'JavaScript']
    },
    {
      name: 'Chaima Messaoudi',
      email: 'chaima.messaoudi@etudiant.enipath.tn',
      role: 'etudiant',
      subtitle: 'Niveau 2 - Groupe A',
      bio: 'Etudiante avancee avec interet pour les projets full-stack et la qualite logicielle.',
      photoUrl: 'app/image/4.jpg',
      skills: ['Angular', 'Spring Boot', 'Git']
    },
    {
      name: 'Hazem Fkaier',
      email: 'hazem.fkaier@enipath.tn',
      role: 'enseignant',
      subtitle: 'Algorithmique - Informatique',
      bio: 'Enseignant en algorithmique, structures de donnees et methodes de resolution.',
      photoUrl: 'app/image/5.jpg',
      skills: ['Algorithmique', 'Java', 'Pedagogie']
    },
    {
      name: 'Mohamed Abidi',
      email: 'mohamed.abidi@enipath.tn',
      role: 'enseignant',
      subtitle: 'Developpement Web - Informatique',
      bio: 'Specialiste frontend et design web, accompagne les projets d interfaces modernes.',
      photoUrl: 'app/image/6.jpg',
      skills: ['Web', 'Angular', 'UX']
    },
    {
      name: 'Olfa Lammouchi',
      email: 'olfa.lammouchi@enipath.tn',
      role: 'enseignant',
      subtitle: 'Bases de donnees - Informatique',
      bio: 'Ingenieure base de donnees confirmee, focalisee sur SQL et modelisation relationnelle.',
      photoUrl: 'app/image/7.jpg',
      skills: ['SQL', 'SGBD', 'Modelisation']
    },
    {
      name: 'Sami Ben Ali',
      email: 'chef.ti@enipath.tn',
      role: 'chef-departement',
      subtitle: 'Chef departement Informatique',
      bio: 'Supervise les parcours pedagogiques, les reclamations et la coordination academique.',
      photoUrl: 'app/image/8.jpg',
      skills: ['Supervision', 'Coordination', 'Qualite']
    }
  ];
}