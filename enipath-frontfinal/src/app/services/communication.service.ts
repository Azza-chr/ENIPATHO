import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

import { AppRole, AuthSession } from '../models/auth.models';
import {
  Announcement,
  AnnouncementAudience,
  AnnouncementPriority,
  MessageItem
} from '../models/communication.models';

const API = 'http://localhost:8080';

@Injectable({ providedIn: 'root' })
export class CommunicationService implements OnDestroy {

  private stompClient: Client | null = null;
  private currentUserId: string | null = null;
  private currentSession: AuthSession | null = null;

  private readonly announcementsSubject = new BehaviorSubject<Announcement[]>(this.seedAnnouncements());
  private readonly messagesSubject = new BehaviorSubject<MessageItem[]>(this.seedMessages());

  readonly announcements$ = this.announcementsSubject.asObservable();
  readonly messages$ = this.messagesSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  // ─── WebSocket ────────────────────────────────────────────────────────────

  connect(session: AuthSession): void {
    if (this.stompClient?.active) return;

    this.currentSession = session;
    this.currentUserId = session.id ? String(session.id) : session.fullName;

    this.stompClient = new Client({
      webSocketFactory: () => new (SockJS as any)(`${API}/ws`),
      reconnectDelay: 5000,
      onConnect: () => {
        // Recevoir annonces broadcast
        this.stompClient!.subscribe('/topic/annonces', (msg) => {
          const annonce: Announcement = JSON.parse(msg.body);
          const current = this.announcementsSubject.value;
          // Eviter les doublons
          if (!current.find(a => a.id === annonce.id)) {
            this.announcementsSubject.next([annonce, ...current]);
          }
        });

        // Recevoir messages privés
        this.stompClient!.subscribe(
          `/topic/messages/${this.currentUserId}`,
          (msg) => {
            const message: MessageItem = JSON.parse(msg.body);
            const current = this.messagesSubject.value;
            if (!current.find(m => m.id === message.id)) {
              this.messagesSubject.next([...current, message]);
            }
          }
        );
      },
      onStompError: (frame) => {
        console.warn('WebSocket STOMP error:', frame);
      }
    });

    this.stompClient.activate();
  }

  disconnect(): void {
    this.stompClient?.deactivate();
    this.stompClient = null;
  }

  ngOnDestroy(): void {
    this.disconnect();
  }

  // ─── Getters ──────────────────────────────────────────────────────────────

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
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  messagesFor(session: AuthSession): MessageItem[] {
    return this.messages
      .filter((item) => item.fromRole === session.role || item.toRole === session.role)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  messagesForContact(session: AuthSession, contactKey: string): MessageItem[] {
    return this.messagesFor(session).filter((item) => {
      const key = item.contactKey ?? this.defaultContactKey(item);
      return key === contactKey;
    });
  }

  // ─── Publier annonce ──────────────────────────────────────────────────────

  publishAnnouncement(session: AuthSession, data: {
    title: string;
    body: string;
    audience: AnnouncementAudience;
    priority: AnnouncementPriority;
  }): void {
    const annonce: Announcement = {
      id: crypto.randomUUID(),
      title: data.title.trim(),
      body: data.body.trim(),
      audience: data.audience,
      priority: data.priority,
      authorName: session.fullName,
      authorRole: session.role,
      createdAt: new Date().toISOString()
    };

    if (this.stompClient?.active) {
      // Broadcast via WebSocket → reçu par tous les abonnés /topic/annonces
      this.stompClient.publish({
        destination: '/app/annonce',
        body: JSON.stringify(annonce)
      });
    } else {
      // Fallback local
      const current = this.announcementsSubject.value;
      this.announcementsSubject.next([annonce, ...current]);
    }
  }

  // ─── Envoyer message ──────────────────────────────────────────────────────

  sendMessage(session: AuthSession, data: {
    subject: string;
    body: string;
    toRole: AppRole;
    contactKey?: string;
    contactName?: string;
  }): void {
    const recipientId = data.contactKey ?? data.toRole;

    const message: MessageItem = {
      id: crypto.randomUUID(),
      subject: data.subject.trim(),
      body: data.body.trim(),
      toRole: data.toRole,
      fromName: session.fullName,
      fromRole: session.role,
      contactKey: data.contactKey,
      contactName: data.contactName,
      createdAt: new Date().toISOString()
    };

    // Ajout local immédiat (optimistic update)
    const current = this.messagesSubject.value;
    this.messagesSubject.next([...current, message]);

    if (this.stompClient?.active) {
      // Envoi WebSocket → destinataire reçoit sur /topic/messages/{recipientId}
      this.stompClient.publish({
        destination: '/app/message',
        body: JSON.stringify({
          id: message.id,
          senderId: this.currentUserId,
          senderName: session.fullName,
          senderRole: session.role,
          recipientId: recipientId,
          content: data.body,
          timestamp: message.createdAt
        })
      });
    }
  }

  // ─── Seeds ────────────────────────────────────────────────────────────────

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

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private defaultContactKey(item: MessageItem): string {
    if (item.fromRole === 'enseignant') return `enseignant-${this.slug(item.fromName)}`;
    if (item.toRole === 'enseignant') return item.contactKey ?? 'enseignant-general';
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