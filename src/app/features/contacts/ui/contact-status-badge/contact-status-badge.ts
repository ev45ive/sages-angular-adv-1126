import { Component, computed, input } from '@angular/core';
import { Badge } from '@shared';
import { CONTACT_STATUS, ContactStatus } from '../../model/contact.model';

@Component({
  selector: 'app-contact-status-badge',
  imports: [Badge],
  styles: `
    :host {
      --badge-bg: #e5e7eb;
      --badge-fg: #374151;
    }

    :host([data-contact-status='lead']) {
      --badge-bg: #ffedd5;
      --badge-fg: #9a3412;
    }

    :host([data-contact-status='prospect']) {
      --badge-bg: #dbeafe;
      --badge-fg: #1e3a8a;
    }

    :host([data-contact-status='customer']) {
      --badge-bg: #dcfce7;
      --badge-fg: #14532d;
    }

    :host([data-contact-status='churned']) {
      --badge-bg: #fee2e2;
      --badge-fg: #7f1d1d;
    }
  `,
  template: ` <app-badge>{{ label() }}</app-badge> `,
  host: {
    class: 'block',
    '[attr.data-contact-status]': 'status()',
  },
})
export class ContactStatusBadge {
  readonly status = input.required<ContactStatus>();

  protected readonly label = computed(() => CONTACT_STATUS[this.status()]);
}
