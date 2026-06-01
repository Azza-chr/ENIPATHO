import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import {
  DashboardStats, EtudiantSuivi, EnseignantSuivi,
  Notification, Reclamation
} from '../../models/auth.azza';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {

  activeTab = 'overview';
  loading = true;
  error: string | null = null;
  Math = Math;

  stats: DashboardStats | null = null;
  etudiants: EtudiantSuivi[] = [];
  enseignants: EnseignantSuivi[] = [];
  notifications: Notification[] = [];
  reclamations: Reclamation[] = [];

  newNotif = { titre: '', contenu: '', cible: 'ALL' };
  selectedReclamation: Reclamation | null = null;
  reclamationReponse = { reponseAdmin: '', statut: 'RESOLUE' };

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const session = this.authService.session;
    if (!session || session.role !== 'chef-departement') {
      this.router.navigate(['/login']);
      return;
    }
    this.loadAll(session.id ?? 0);
  }

  loadAll(adminId: number): void {
    this.loading = true;
    this.error = null;

    this.adminService.getStats(adminId).subscribe({
      next: (s: any) => { this.stats = s; this.loading = false; },
      error: (err: any) => {
        console.error('Stats error:', err);
        this.error = 'Impossible de charger les statistiques.';
        this.loading = false;
      }
    });

    this.adminService.getEtudiants().subscribe({
      next: (d: any) => this.etudiants = d,
      error: (err: any) => console.error('Etudiants error:', err)
    });

    this.adminService.getEnseignants().subscribe({
      next: (d: any) => this.enseignants = d,
      error: (err: any) => console.error('Enseignants error:', err)
    });

    this.adminService.getNotifications().subscribe({
      next: (d: any) => this.notifications = d,
      error: (err: any) => console.error('Notifications error:', err)
    });

    this.adminService.getReclamations().subscribe({
      next: (d: any) => this.reclamations = d,
      error: (err: any) => console.error('Reclamations error:', err)
    });
  }

  setTab(tab: string): void { this.activeTab = tab; }

  sendNotification(): void {
    if (!this.newNotif.titre.trim() || !this.newNotif.contenu.trim()) return;
    this.adminService.createNotification(this.newNotif).subscribe({
      next: (n: any) => {
        this.notifications.unshift(n);
        this.newNotif = { titre: '', contenu: '', cible: 'ALL' };
        if (this.stats) this.stats.notificationsActives++;
      },
      error: (err: any) => console.error('Create notif error:', err)
    });
  }

  deactivateNotif(id: number): void {
    this.adminService.deactivateNotification(id).subscribe({
      next: () => {
        const n = this.notifications.find(x => x.id === id);
        if (n) {
          n.active = false;
          if (this.stats && this.stats.notificationsActives > 0)
            this.stats.notificationsActives--;
        }
      },
      error: (err: any) => console.error('Deactivate notif error:', err)
    });
  }

  openReclamation(r: Reclamation): void {
    this.selectedReclamation = r;
    this.reclamationReponse = { reponseAdmin: r.reponseAdmin || '', statut: 'RESOLUE' };
  }

  closeReclamation(): void { this.selectedReclamation = null; }

  submitReponse(): void {
    if (!this.selectedReclamation) return;
    this.adminService.traiterReclamation(
      this.selectedReclamation.id,
      this.reclamationReponse
    ).subscribe({
      next: (updated: any) => {
        const idx = this.reclamations.findIndex(x => x.id === updated.id);
        if (idx !== -1) this.reclamations[idx] = updated;
        if (this.stats && this.selectedReclamation?.statut === 'EN_ATTENTE') {
          this.stats.reclamationsEnAttente = Math.max(0, this.stats.reclamationsEnAttente - 1);
        }
        this.closeReclamation();
      },
      error: (err: any) => console.error('Traiter reclamation error:', err)
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getStatutClass(statut: string): string {
    const map: Record<string, string> = {
      'EN_ATTENTE': 'badge-warning',
      'EN_COURS':   'badge-info',
      'RESOLUE':    'badge-success',
      'REJETEE':    'badge-danger'
    };
    return map[statut] ?? '';
  }

  get adminUser() { return this.authService.session; }

  get pendingReclamations(): number {
    return this.reclamations.filter((r: any) => r.statut === 'EN_ATTENTE').length;
  }
}