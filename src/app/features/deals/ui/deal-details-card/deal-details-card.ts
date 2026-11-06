import { CurrencyPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { SharedImports } from '@shared';
import { Deal } from '../../model/deal.model';
import { DealStageBadge } from '../deal-stage-badge/deal-stage-badge';

@Component({
  selector: 'app-deal-details-card',
  imports: [SharedImports, CurrencyPipe, DealStageBadge],
  styles: `
    :host {
      display: block;
    }
  `,
  template: `
    <mat-card appearance="outlined">
      @if (deal(); as deal) {
        <mat-card-header>
          <mat-card-title>{{ deal.title }}</mat-card-title>
          <mat-card-subtitle>{{ deal.summary }}</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <app-deal-stage-badge [stage]="deal.stage" />
          <dl class="mt-4 grid grid-cols-3 gap-4 text-body-md">
            <div>
              <dt class="meta">Value</dt>
              <dd class="mt-1 text-title-sm">
                {{ deal.value.amount | currency: deal.value.currency : 'symbol' : '1.0-0' }}
              </dd>
            </div>
            <div>
              <dt class="meta">Contact</dt>
              <dd class="mt-1 text-title-sm">{{ contactName() ?? deal.contactId }}</dd>
            </div>
            <div>
              <dt class="meta">Public</dt>
              <dd class="mt-1 text-title-sm">{{ deal.isPublic ? 'Yes' : 'No' }}</dd>
            </div>
          </dl>
        </mat-card-content>
        <mat-card-actions align="end">
          <button matButton="outlined" type="button" (click)="editRequested.emit()">Edit</button>
        </mat-card-actions>
      } @else {
        <ng-content select="[empty-state]">
          <div class="flex my-10 justify-center items-center">
            <p>Select a deal</p>
          </div>
        </ng-content>
      }
    </mat-card>
  `,
})
export class DealDetailsCard {
  readonly deal = input<Deal>();
  // Shown instead of the raw contact id once known
  readonly contactName = input<string>();
  readonly editRequested = output<void>();
}
