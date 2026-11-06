import { CurrencyPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { Deal } from '../../model/deal.model';
import { AccountNamePipe } from '../pipes/account-name-pipe';
import { DealStageBadge } from '../deal-stage-badge/deal-stage-badge';

@Component({
  selector: 'app-deal-list-item',
  imports: [AccountNamePipe, CurrencyPipe, DealStageBadge],
  host: {
    class: 'block group',
    '[attr.data-selected]': 'selected()',
  },
  template: `
   <div>
     <p class="truncate text-title-sm">{{ deal().title }} — {{ deal().accountId | accountName }}</p>
    <div class=" flex justify-between">
      <p class="text-body-sm text-on-surface-variant flex-1 group-data-[selected=true]:text-on-secondary-container">
        {{ deal().value.amount | currency: deal().value.currency : 'symbol' : '1.0-0' }}
      </p>
      <app-deal-stage-badge [stage]="deal().stage" />
    </div>
   </div>
  `,
})
export class DealListItem {
  readonly deal = input.required<Deal>();
  readonly selected = input(false);
}
