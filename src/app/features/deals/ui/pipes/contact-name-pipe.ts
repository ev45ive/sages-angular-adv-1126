import { inject, Pipe, PipeTransform } from '@angular/core';
import { DealsStore } from '../../data/deals.store';

@Pipe({
  name: 'contactName',
  // pure: false // disable memoization
})
export class ContactNamePipe implements PipeTransform {
  private readonly store = inject(DealsStore);

  // memoization 
  // - return value changes only if parameters change

  // Function is not PURE - store can return different values
  transform(contactId: string): string {
    return this.store.contactName(contactId);
  }
}
