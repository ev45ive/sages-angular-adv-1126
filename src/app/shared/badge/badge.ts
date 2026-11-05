import { Component, input } from '@angular/core';
import { SharedUI } from '../shared-module';

export type BadgeSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-badge',
  imports: [...SharedUI],
  styles: `
    :host {
      display: inline-block;
      --badge-chip-height: 20px;
      --badge-chip-font-size: 0.6875rem;
      --badge-chip-line-height: 1rem;
      --badge-chip-radius: 10px;
    }

    :host([data-size='md']) {
      --badge-chip-height: 24px;
      --badge-chip-font-size: 0.75rem;
      --badge-chip-line-height: 1rem;
      --badge-chip-radius: 12px;
    }

    :host([data-size='lg']) {
      --badge-chip-height: 32px;
      --badge-chip-font-size: 0.875rem;
      --badge-chip-line-height: 1.25rem;
      --badge-chip-radius: 16px;
    }

    mat-chip {
      --mat-chip-container-height: var(--badge-chip-height);
      --mat-chip-label-text-size: var(--badge-chip-font-size);
      --mat-chip-label-text-line-height: var(--badge-chip-line-height);
      --mat-chip-container-shape-radius: var(--badge-chip-radius);
      --mat-chip-elevated-container-color: var(--badge-bg);
      --mat-chip-label-text-color: var(--badge-fg);
      background-color: var(--badge-bg);
      color: var(--badge-fg);
    }
  `,
  template: `
    <mat-chip>
      <ng-content />
    </mat-chip>
  `,
  host: {
    '[attr.data-size]': 'size()',
  },
})
export class Badge {
  readonly size = input<BadgeSize>('sm');
}
