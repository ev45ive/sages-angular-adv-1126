import { Component } from '@angular/core';
import { SharedUI } from '../shared-module';

@Component({
  selector: 'app-badge',
  imports: [...SharedUI],
  styles: `
    :host {
      display: inline-block;
    }

    mat-chip {
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
})
export class Badge {}
