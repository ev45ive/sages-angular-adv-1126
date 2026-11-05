import { CurrencyPipe } from '@angular/common';
import { Component, input, model, output } from '@angular/core';
import { SharedImports } from '@shared';
import { Deal } from '../../model/deal.model';
import { AccountNamePipe } from '../pipes/account-name-pipe';
import { DealStageBadge } from '../deal-stage-badge/deal-stage-badge';

@Component({
  selector: 'app-deal-master-list',
  imports: [SharedImports, AccountNamePipe, CurrencyPipe, DealStageBadge],
  styles: `
    :host {
      display: block;
    }
  `,
  template: `
    <mat-form-field class="w-full">
      <mat-label>Filter deals</mat-label>
      <input matInput type="search" #filterInput (input)="filterText.set(filterInput.value)" />
      <mat-icon matSuffix aria-hidden="true">search</mat-icon>
    </mat-form-field>

    <button matButton="outlined" type="button" (click)="createRequested.emit()">Create new</button>

    <mat-list class="mt-3">
      @for (deal of deals(); track deal.id) {
        <button
          mat-list-item
          type="button"
          [attr.aria-current]="deal.id === selectedId() ? 'true' : null"
          [activated]="deal.id === selectedId()"
          (click)="dealSelected.emit(deal.id)"
        >
          <span matListItemTitle>{{ deal.title }} — {{ deal.accountId | accountName }}</span>
          <span matListItemLine>
            {{ deal.value.amount | currency: deal.value.currency : 'symbol' : '1.0-0' }}
          </span>
          <app-deal-stage-badge matListItemMeta [stage]="deal.stage" />
        </button>
      } @empty {
        <mat-list-item>
          <span matListItemTitle>No deals match the filter</span>
        </mat-list-item>
      }
    </mat-list>
  `,
})
export class DealMasterList {
  readonly deals = input.required<Deal[]>();
  readonly selectedId = input<string | null>(null);
  readonly filterText = model('');
  readonly dealSelected = output<string>();
  readonly createRequested = output<void>();
}
