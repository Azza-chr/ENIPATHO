import { AppRole } from './auth.models';

export type AnnouncementAudience =
  | 'tous'
  | AppRole
  | 'groupe-a'
  | 'groupe-b'
  | 'groupe-c'
  | 'groupe-d';
export type AnnouncementPriority = 'normal' | 'important' | 'urgent';

export interface Announcement {
  id: string;
  title: string;
  body: string;
  audience: AnnouncementAudience;
  priority: AnnouncementPriority;
  authorName: string;
  authorRole: AppRole;
  createdAt: string;
}

export interface MessageItem {
  id: string;
  subject: string;
  body: string;
  fromName: string;
  fromRole: AppRole;
  toRole: AppRole;
  contactKey?: string;
  contactName?: string;
  createdAt: string;
}
