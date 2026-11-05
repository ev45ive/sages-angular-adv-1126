import { CurrencyPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { SharedImports } from '@shared';
import { Deal, DEAL_STAGE_LABELS } from '../../model/deal.model';
import { AccountNamePipe } from '../pipes/account-name-pipe';
import { ContactNamePipe } from '../pipes/contact-name-pipe';

@Component({
  selector: 'app-deal-details-card',
  imports: [SharedImports, AccountNamePipe, ContactNamePipe, CurrencyPipe],
  styles: `
    :host {
      display: block;
    }

    mat-chip-set {
      display: flex;
    }
  `,
  template: `
    <mat-card appearance="outlined">
      <mat-card-header>
        <mat-card-title>{{ deal().title }} — {{ deal().accountId | accountName }}</mat-card-title>
        <mat-card-subtitle>{{ deal().summary }}</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <mat-chip-set>
          <mat-chip>{{ stageLabels[deal().stage] }}</mat-chip>
        </mat-chip-set>
        <dl class="mt-4 grid grid-cols-3 gap-4 text-body-md">
          <div>
            <dt class="meta">Value</dt>
            <dd class="mt-1 text-title-sm">
              {{ deal().value.amount | currency: deal().value.currency : 'symbol' : '1.0-0' }}
            </dd>
          </div>
          <div>
            <dt class="meta">Contact</dt>
            <dd class="mt-1 text-title-sm">{{ deal().contactId | contactName }}</dd>
          </div>
          <div>
            <dt class="meta">Public</dt>
            <dd class="mt-1 text-title-sm">{{ deal().isPublic ? 'Yes' : 'No' }}</dd>
          </div>
        </dl>
      </mat-card-content>
      <mat-card-actions align="end">
        <button matButton="outlined" type="button" (click)="editRequested.emit()">Edit</button>
      </mat-card-actions>
    </mat-card>
  `,
})
export class DealDetailsCard {
  readonly deal = input.required<Deal>();
  readonly editRequested = output<void>();

  protected readonly stageLabels = DEAL_STAGE_LABELS;
}
