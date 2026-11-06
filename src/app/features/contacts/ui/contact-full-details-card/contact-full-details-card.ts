import { Component, computed, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Avatar } from '@shared';
import { CONTACT_STATUS, Contact, contactFullName } from '../../model/contact.model';
import { ContactStatusBadge } from '../contact-status-badge/contact-status-badge';

@Component({
  selector: 'app-contact-full-details-card',
  imports: [DatePipe, Avatar, ContactStatusBadge],
  template: `
    <article class="flex flex-col gap-6 rounded-xl bg-surface-container-low p-6">
      <header class="flex items-center gap-4">
        <app-avatar [name]="fullName()" [src]="contact().avatarUrl ?? ''" size="lg" />
        <div class="flex min-w-0 flex-col gap-1">
          <h2 class="text-title-lg">{{ fullName() }}</h2>
          @if (contact().company) {
            <p class="text-body-md text-on-surface-variant">{{ contact().company }}</p>
          }
          <app-contact-status-badge [status]="contact().status" />
        </div>
      </header>

      <dl class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <dt class="text-label-md text-on-surface-variant">Email</dt>
          <dd class="text-body-md">{{ contact().email }}</dd>
        </div>
        <div>
          <dt class="text-label-md text-on-surface-variant">Phone</dt>
          <dd class="text-body-md">{{ contact().phone || '-' }}</dd>
        </div>
        <div>
          <dt class="text-label-md text-on-surface-variant">Created</dt>
          <dd class="text-body-md">{{ contact().createdAt | date: 'longDate' }}</dd>
        </div>
        <div>
          <dt class="text-label-md text-on-surface-variant">Status</dt>
          <dd class="text-body-md">{{ statusLabel() }}</dd>
        </div>
        <div class="md:col-span-2">
          <dt class="text-label-md text-on-surface-variant">Notes</dt>
          <dd class="text-body-md whitespace-pre-line">{{ contact().notes || '-' }}</dd>
        </div>
      </dl>
    </article>
  `,
  host: {
    class: 'block',
  },
})
export class ContactFullDetailsCard {
  readonly contact = input.required<Contact>();

  protected readonly fullName = computed(() => contactFullName(this.contact()));
  protected readonly statusLabel = computed(() => CONTACT_STATUS[this.contact().status]);
}
