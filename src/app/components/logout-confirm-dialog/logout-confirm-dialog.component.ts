import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-logout-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>Confirmation de Déconnexion</h2>
    <mat-dialog-content>
      <p>Êtes-vous sûr de vouloir vous déconnecter ?</p>
      <p class="text-muted">Votre session sera fermée et vous serez redirigé vers la page de connexion.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Annuler</button>
      <button mat-raised-button color="warn" (click)="onConfirm()">
        Déconnexion
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    p.text-muted {
      color: #666;
      font-size: 14px;
    }
  `]
})
export class LogoutConfirmDialogComponent {

  constructor(public dialogRef: MatDialogRef<LogoutConfirmDialogComponent>) { }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
