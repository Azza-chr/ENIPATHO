import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about-page.component.html',
  styleUrl: './about-page.component.css'
})
export class AboutPageComponent {
  readonly team = [
    {
      name: 'Marwa Rokbani',
      role: 'Developpement full-stack et integration',
      photo: 'app/image/1.jpg'
    },
    {
      name: 'Sahar Jleli',
      role: 'Experience utilisateur et parcours cours',
      photo: 'app/image/2.jpg'
    },
    {
      name: 'Ghofrane Yahya',
      role: 'Donnees academiques et quiz',
      photo: 'app/image/3.jpg'
    },
    {
      name: 'Azza Chrabekh',
      role: 'Messagerie et suivi technique',
      photo: 'app/image/4.jpg'
    }
  ];
}
