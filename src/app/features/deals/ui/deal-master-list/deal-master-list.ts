import { Component, input, model, output } from '@angular/core';
import { SharedImports } from '@shared';
import { Deal } from '../../model/deal.model';
import { DealListItem } from '../deal-list-item/deal-list-item';

@Component({
  selector: 'app-deal-master-list',
  imports: [SharedImports, DealListItem],
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
        <app-deal-list-item
          [deal]="deal"
          [selected]="deal.id === selectedId()"
          (dealSelected)="dealSelected.emit($event)"
        />
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
