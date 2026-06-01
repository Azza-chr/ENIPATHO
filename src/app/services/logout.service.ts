import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { LogoutConfirmDialogComponent } from '../components/logout-confirm-dialog/logout-confirm-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class LogoutService {

  constructor(
    private dialog: MatDialog,
    private router: Router
  ) { }

  /**
   * Affiche le dialogue de confirmation et se déconnecte
   */
  logout(): void {
    const dialogRef = this.dialog.open(LogoutConfirmDialogComponent, {
      width: '400px',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.performLogout();
      }
    });
  }

  /**
   * Effectue la déconnexion
   */
  private performLogout(): void {
    // Supprimer le token du localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_email');

    this.router.navigate(['/etudiant']);
  }
}
