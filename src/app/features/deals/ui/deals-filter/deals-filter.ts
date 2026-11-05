import { Component, model } from '@angular/core';
import { SharedModule } from '@shared';

@Component({
  selector: 'app-deals-filter',
  imports: [SharedModule],
  template: `
    <mat-form-field class="w-full">
      <mat-label>Filter deals</mat-label>
      <input
        matInput
        type="search"
        #filterInput
        [value]="value()"
        (input)="value.set(filterInput.value)"
      />
      <mat-icon matSuffix aria-hidden="true">search</mat-icon>
    </mat-form-field>
  `,
  host: { class: 'block' },
})
export class DealsFilter {
  readonly value = model('');
}
