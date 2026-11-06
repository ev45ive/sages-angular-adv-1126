// Mirrors server/openapi.yaml (Contact, PagingObject_Contact, ContactSearchResponse).
// Features cannot import core/model, so the shape is kept here.

export const CONTACT_STATUS = {
  lead: 'Lead',
  prospect: 'Prospect',
  customer: 'Customer',
  churned: 'Churned',
} as const;

export type ContactStatus = keyof typeof CONTACT_STATUS;

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: ContactStatus;
  createdAt: string;
  phone?: string;
  company?: string;
  avatarUrl?: string;
  notes?: string;
}

export interface PagedContacts {
  items: Contact[];
  total: number;
  offset: number;
  limit: number;
}

export interface ContactSearchResponse {
  contacts: PagedContacts;
}

export function contactFullName(contact: Pick<Contact, 'firstName' | 'lastName'>): string {
  return `${contact.firstName} ${contact.lastName}`;
}
