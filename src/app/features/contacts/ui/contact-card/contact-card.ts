import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Avatar } from '@shared';
import { Contact, contactFullName } from '../../model/contact.model';
import { ContactStatusBadge } from '../contact-status-badge/contact-status-badge';

@Component({
  selector: 'app-contact-card',
  imports: [RouterLink, Avatar, ContactStatusBadge],
  template: `
    <a
      class="flex items-center gap-4 rounded-xl bg-surface-container-low p-4 text-on-surface no-underline hover:bg-surface-container focus-visible:outline-2 focus-visible:outline-offset-2"
      [routerLink]="['/contacts', contact().id]"
    >
      <app-avatar [name]="fullName()" [src]="contact().avatarUrl ?? ''" />
      <div class="min-w-0 flex-1">
        <p class="truncate text-title-md">{{ fullName() }}</p>
        @if (contact().company) {
          <p class="truncate text-body-sm text-on-surface-variant">{{ contact().company }}</p>
        }
        <p class="truncate text-body-sm text-on-surface-variant">{{ contact().email }}</p>
      </div>
      <app-contact-status-badge [status]="contact().status" />
    </a>
  `,
  host: {
    class: 'block',
  },
})
export class ContactCard {
  readonly contact = input.required<Contact>();

  protected readonly fullName = computed(() => contactFullName(this.contact()));
}
