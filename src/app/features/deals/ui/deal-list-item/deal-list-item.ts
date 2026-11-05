import { CurrencyPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { SharedImports } from '@shared';
import { Deal } from '../../model/deal.model';
import { AccountNamePipe } from '../pipes/account-name-pipe';
import { DealStageBadge } from '../deal-stage-badge/deal-stage-badge';

@Component({
  selector: 'app-deal-list-item',
  imports: [SharedImports, AccountNamePipe, CurrencyPipe, DealStageBadge],
  styles: `
    :host {
      display: block;
    }
  `,
  template: `
    <button
      mat-list-item
      type="button"
      [attr.aria-current]="selected() ? 'true' : null"
      [activated]="selected()"
      (click)="dealSelected.emit(deal().id)"
    >
      <span matListItemTitle>{{ deal().title }} — {{ deal().accountId | accountName }}</span>
      <span matListItemLine>
        {{ deal().value.amount | currency: deal().value.currency : 'symbol' : '1.0-0' }}
      </span>
      <app-deal-stage-badge matListItemMeta [stage]="deal().stage" />
    </button>
  `,
})
export class DealListItem {
  readonly deal = input.required<Deal>();
  readonly selected = input(false);
  readonly dealSelected = output<string>();
}
