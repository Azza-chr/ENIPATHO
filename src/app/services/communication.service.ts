import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { AppRole, AuthSession } from '../models/auth.models';
import {
  Announcement,
  AnnouncementAudience,
  AnnouncementPriority,
  MessageItem
} from '../models/communication.models';

@Injectable({
  providedIn: 'root'
})
export class CommunicationService {
  private static readonly announcementsKey = 'enipath.announcements';
  private static readonly messagesKey = 'enipath.messages';

  private readonly announcementsSubject = new BehaviorSubject<Announcement[]>(this.restoreAnnouncements());
  private readonly messagesSubject = new BehaviorSubject<MessageItem[]>(this.restoreMessages());

  readonly announcements$ = this.announcementsSubject.asObservable();
  readonly messages$ = this.messagesSubject.asObservable();

  get announcements(): Announcement[] {
    return this.announcementsSubject.value;
  }

  get messages(): MessageItem[] {
    return this.messagesSubject.value;
  }

  announcementsFor(session: AuthSession): Announcement[] {
    return this.announcements
      .filter((item) => {
        if (item.audience === 'tous') return true;
        if (item.audience === session.role) return true;
        if (session.role === 'etudiant' && session.grp) {
          if (item.audience === `groupe-${session.grp.toLowerCase()}`) return true;
        }
        return false;
      })
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }

  messagesFor(session: AuthSession): MessageItem[] {
    return this.messages
      .filter((item) => item.fromRole === session.role || item.toRole === session.role)
      .sort((left, right) => left.createdAt.localeCompare(right.createdAt));
  }

  messagesForContact(session: AuthSession, contactKey: string): MessageItem[] {
    return this.messagesFor(session).filter((item) => {
      const key = item.contactKey ?? this.defaultContactKey(item);
      return key === contactKey;
    });
  }

  publishAnnouncement(
    session: AuthSession,
    data: {
      title: string;
      body: string;
      audience: AnnouncementAudience;
      priority: AnnouncementPriority;
    }
  ): void {
    const next: Announcement[] = [
      {
        id: crypto.randomUUID(),
        title: data.title.trim(),
        body: data.body.trim(),
        audience: data.audience,
        priority: data.priority,
        authorName: session.fullName,
        authorRole: session.role,
        createdAt: new Date().toISOString()
      },
      ...this.announcements
    ];

    this.saveAnnouncements(next);
  }

  sendMessage(
    session: AuthSession,
    data: {
      subject: string;
      body: string;
      toRole: AppRole;
      contactKey?: string;
      contactName?: string;
    }
  ): void {
    const next: MessageItem[] = [
      {
        id: crypto.randomUUID(),
        subject: data.subject.trim(),
        body: data.body.trim(),
        toRole: data.toRole,
        fromName: session.fullName,
        fromRole: session.role,
        contactKey: data.contactKey,
        contactName: data.contactName,
        createdAt: new Date().toISOString()
      },
      ...this.messages
    ];

    this.saveMessages(next);
  }

  private restoreAnnouncements(): Announcement[] {
    return this.restore<Announcement[]>(CommunicationService.announcementsKey, this.seedAnnouncements());
  }

  private restoreMessages(): MessageItem[] {
    return this.restore<MessageItem[]>(CommunicationService.messagesKey, this.seedMessages());
  }

  private restore<T>(key: string, fallback: T): T {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }

    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  private saveAnnouncements(items: Announcement[]): void {
    localStorage.setItem(CommunicationService.announcementsKey, JSON.stringify(items));
    this.announcementsSubject.next(items);
  }

  private saveMessages(items: MessageItem[]): void {
    localStorage.setItem(CommunicationService.messagesKey, JSON.stringify(items));
    this.messagesSubject.next(items);
  }

  private seedAnnouncements(): Announcement[] {
    return [
      {
        id: 'seed-announcement-1',
        title: 'Bienvenue sur ENIPATH',
        body: 'Les annonces publiees par les enseignants et le chef de departement apparaitront ici en temps reel.',
        audience: 'tous',
        priority: 'important',
        authorName: 'Administration ENIPATH',
        authorRole: 'chef-departement',
        createdAt: new Date().toISOString()
      }
    ];
  }

  private seedMessages(): MessageItem[] {
    const now = Date.now();
    return [
      {
        id: 'seed-message-student-2',
        subject: 'Probleme acces quiz Java',
        body: 'Bonjour, le quiz Java ne s ouvre pas apres la lecture du cours PDF.',
        fromName: 'Chaima Messaoudi',
        fromRole: 'etudiant',
        toRole: 'chef-departement',
        contactKey: 'etudiant-chaima-messaoudi',
        contactName: 'Chaima Messaoudi',
        createdAt: new Date(now - 1000 * 60 * 12).toISOString()
      },
      {
        id: 'seed-message-student-1',
        subject: 'Demande support PDF',
        body: 'Bonjour, je ne trouve pas le support SGBD dans mon espace cours.',
        fromName: 'Youssef Gharbi',
        fromRole: 'etudiant',
        toRole: 'chef-departement',
        contactKey: 'etudiant-youssef-gharbi',
        contactName: 'Youssef Gharbi',
        createdAt: new Date(now - 1000 * 60 * 46).toISOString()
      },
      {
        id: 'seed-message-1',
        subject: 'Canal de coordination ouvert',
        body: 'Les professeurs et le chef de departement peuvent echanger ici sur les cours, annonces et suivis pedagogiques.',
        fromName: 'Administration ENIPATH',
        fromRole: 'chef-departement',
        toRole: 'enseignant',
        contactKey: 'enseignant-general',
        contactName: 'Equipe enseignante',
        createdAt: new Date(now - 1000 * 60 * 90).toISOString()
      }
    ];
  }

  private defaultContactKey(item: MessageItem): string {
    if (item.fromRole === 'enseignant') {
      return `enseignant-${this.slug(item.fromName)}`;
    }

    if (item.toRole === 'enseignant') {
      return item.contactKey ?? 'enseignant-general';
    }

    return 'chef-departement';
  }

  private slug(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'contact';
  }
}
