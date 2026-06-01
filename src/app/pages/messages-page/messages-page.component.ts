import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AppRole } from '../../models/auth.models';
import { MessageItem } from '../../models/communication.models';
import { AuthService } from '../../services/auth.service';
import { CommunicationService } from '../../services/communication.service';

type DepartmentContact = {
  key: string;
  name: string;
  subtitle: string;
  initials: string;
  unread: boolean;
  latestAt: string;
  lastActivityLabel: string;
};

@Component({
  selector: 'app-messages-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './messages-page.component.html',
  styleUrl: './messages-page.component.css'
})
export class MessagesPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly communication = inject(CommunicationService);

  messages: MessageItem[] = [];
  allMessages: MessageItem[] = [];
  successMessage = '';
  selectedContactKey = 'chef-departement';

  readonly form = this.fb.group({
    toRole: ['chef-departement' as AppRole, Validators.required],
    subject: ['', Validators.required],
    body: ['', Validators.required]
  });

  get session() {
    return this.auth.session;
  }

  get recipients(): Array<{ label: string; value: AppRole }> {
    if (this.session?.role === 'chef-departement') {
      return [{ label: 'Etudiants', value: 'etudiant' }];
    }

    return [{ label: 'Chef de departement', value: 'chef-departement' }];
  }

  get departmentContacts(): DepartmentContact[] {
    const base = [
      { key: 'etudiant-youssef-gharbi', name: 'Youssef Gharbi', subtitle: 'Niveau 1 - Groupe A' },
      { key: 'etudiant-fatma-jlassi', name: 'Fatma Jlassi', subtitle: 'Niveau 1 - Groupe A' },
      { key: 'etudiant-omar-chaabane', name: 'Omar Chaabane', subtitle: 'Niveau 1 - Groupe B' },
      { key: 'etudiant-mariem-ayari', name: 'Mariem Ayari', subtitle: 'Niveau 1 - Groupe B' },
      { key: 'etudiant-ahmed-dridi', name: 'Ahmed Dridi', subtitle: 'Niveau 1 - Groupe C' },
      { key: 'etudiant-nour-bensalah', name: 'Nour Ben Salah', subtitle: 'Niveau 1 - Groupe C' },
      { key: 'etudiant-rayen-khemiri', name: 'Rayen Khemiri', subtitle: 'Niveau 1 - Groupe D' },
      { key: 'etudiant-yassine-mejri', name: 'Yassine Mejri', subtitle: 'Niveau 1 - Groupe D' },
      { key: 'etudiant-rania-boughanmi', name: 'Rania Boughanmi', subtitle: 'Niveau 1 - Groupe A' },
      { key: 'etudiant-fares-trabelsi', name: 'Fares Trabelsi', subtitle: 'Niveau 1 - Groupe B' },
      { key: 'etudiant-chaima-messaoudi', name: 'Chaima Messaoudi', subtitle: 'Niveau 2 - Groupe A' },
      { key: 'etudiant-aziz-bouazizi', name: 'Aziz Bouazizi', subtitle: 'Niveau 2 - Groupe A' },
      { key: 'etudiant-eya-cherif', name: 'Eya Cherif', subtitle: 'Niveau 2 - Groupe B' },
      { key: 'etudiant-malek-ammar', name: 'Malek Ammar', subtitle: 'Niveau 2 - Groupe C' },
      { key: 'etudiant-seif-riahi', name: 'Seifeddine Riahi', subtitle: 'Niveau 2 - Groupe D' }
    ];

    const fromMessages = this.allMessages
      .filter((message) => message.fromRole === 'etudiant' || message.toRole === 'etudiant')
      .map((message) => ({
        key: message.contactKey ?? this.contactKeyForName(message.contactName || message.fromName, 'etudiant'),
        name: message.contactName || (message.fromRole === 'etudiant' ? message.fromName : 'Etudiant'),
        subtitle: message.subject || 'Conversation',
        latestAt: message.createdAt
      }));

    const contacts = [...base, ...fromMessages].reduce(
      (map, contact) => {
        const current = map.get(contact.key);
        if (!current || ((contact as { latestAt?: string }).latestAt ?? '') > (current.latestAt ?? '')) {
          map.set(contact.key, { ...current, ...contact, latestAt: (contact as { latestAt?: string }).latestAt ?? current?.latestAt ?? '' });
        }
        return map;
      },
      new Map<string, { key: string; name: string; subtitle: string; latestAt?: string }>()
    );

    return Array.from(contacts.values())
      .map((contact) => {
        const related = this.allMessages.filter(
          (message) =>
            (message.contactKey ?? this.contactKeyForName(message.contactName || message.fromName, 'etudiant')) === contact.key
        );
        const latestAt = related.reduce((latest, message) => (message.createdAt > latest ? message.createdAt : latest), contact.latestAt ?? '');

        return {
          ...contact,
          initials: this.initials(contact.name),
          latestAt,
          lastActivityLabel: latestAt ? this.shortDate(latestAt) : 'Aucun message',
          unread: related.some((message) => message.fromRole === 'etudiant')
        };
      })
      .sort((left, right) => {
        if (!left.latestAt && !right.latestAt) return left.name.localeCompare(right.name);
        return (right.latestAt || '').localeCompare(left.latestAt || '');
      });
  }

  get activeContact(): DepartmentContact {
    if (this.session?.role !== 'chef-departement') {
      return {
        key: 'chef-departement',
        name: 'Chef de departement',
        subtitle: 'Direction pedagogique',
        initials: 'CD',
        unread: false,
        latestAt: '',
        lastActivityLabel: ''
      };
    }

    return this.departmentContacts.find((contact) => contact.key === this.selectedContactKey) ?? this.fallbackContact();
  }

  ngOnInit(): void {
    this.form.patchValue({ toRole: this.recipients[0]?.value ?? 'chef-departement' });
    this.refresh();
    this.communication.messages$.subscribe(() => this.refresh());
  }

  selectContact(contactKey: string): void {
    this.selectedContactKey = contactKey;
    this.refresh();
  }

  send(): void {
    const session = this.session;
    if (!session || !this.form.get('body')?.value) {
      return;
    }

    const value = this.form.getRawValue();
    const contact = this.activeContact;
    this.communication.sendMessage(session, {
      toRole: value.toRole as AppRole,
      subject: value.subject || 'Message',
      body: value.body ?? '',
      contactKey: contact?.key,
      contactName: contact?.name
    });

    this.form.patchValue({ body: '', subject: value.subject || 'Message' });
  }

  formatDate(value: string): string {
    return new Date(value).toLocaleString('fr-FR', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  }

  roleLabel(role: AppRole): string {
    const labels: Record<AppRole, string> = {
      etudiant: 'Etudiant',
      enseignant: 'Enseignant',
      'chef-departement': 'Chef de departement'
    };

    return labels[role];
  }

  private refresh(): void {
    if (!this.session) {
      this.messages = [];
      this.allMessages = [];
      return;
    }

    this.allMessages = this.communication.messagesFor(this.session);
    if (this.session.role === 'chef-departement') {
      const hasSelectedContact = this.departmentContacts.some((contact) => contact.key === this.selectedContactKey);
      if (!hasSelectedContact) {
        this.selectedContactKey = this.departmentContacts[0]?.key || 'etudiant-youssef-gharbi';
      }
      this.messages = this.communication.messagesForContact(this.session, this.selectedContactKey);
      this.form.patchValue({ toRole: 'etudiant', subject: this.activeContact?.name || 'Message' });
      return;
    }

    this.selectedContactKey = 'chef-departement';
    this.messages = this.allMessages;
    this.form.patchValue({ toRole: 'chef-departement', subject: 'Message au chef de departement' });
  }

  private initials(value: string): string {
    return value
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  }

  private fallbackContact(): DepartmentContact {
    return {
      key: 'etudiant-youssef-gharbi',
      name: 'Youssef Gharbi',
      subtitle: 'Niveau 1 - Groupe A',
      initials: 'YG',
      unread: false,
      latestAt: '',
      lastActivityLabel: 'Aucun message'
    };
  }

  private shortDate(value: string): string {
    return new Date(value).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private contactKeyForName(value: string, prefix = 'enseignant'): string {
    return `${prefix}-${value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'general'}`;
  }
}
