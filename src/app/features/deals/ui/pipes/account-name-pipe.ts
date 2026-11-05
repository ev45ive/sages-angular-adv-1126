import { inject, Pipe, PipeTransform } from '@angular/core';
import { DealsStore } from '../../data/deals.store';

@Pipe({
  name: 'accountName',
})
export class AccountNamePipe implements PipeTransform {
  private readonly store = inject(DealsStore);

  transform(accountId: string): string {
    return this.store.accountName(accountId);
  }
}
