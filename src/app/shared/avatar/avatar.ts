import { Component, computed, input } from '@angular/core';

export type AvatarSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-avatar',
  styles: `
    :host {
      --avatar-size: 48px;
      --avatar-font-size: 1rem;
      display: inline-flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
      width: var(--avatar-size);
      height: var(--avatar-size);
      overflow: hidden;
      border-radius: 9999px;
      background-color: var(--color-surface-container-high);
      color: var(--color-on-surface);
      font-size: var(--avatar-font-size);
      font-weight: 600;
    }

    :host([data-size='sm']) {
      --avatar-size: 32px;
      --avatar-font-size: 0.75rem;
    }

    :host([data-size='lg']) {
      --avatar-size: 80px;
      --avatar-font-size: 1.5rem;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  `,
  template: `
    @if (src()) {
      <img [src]="src()" [alt]="name()" />
    } @else {
      <span aria-hidden="true">{{ initials() }}</span>
    }
  `,
  host: {
    '[attr.data-size]': 'size()',
  },
})
export class Avatar {
  readonly name = input.required<string>();
  readonly src = input<string>('');
  readonly size = input<AvatarSize>('md');

  protected readonly initials = computed(() =>
    this.name()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join(''),
  );
}
