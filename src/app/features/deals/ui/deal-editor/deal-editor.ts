import { Component, input, output } from '@angular/core';
import { SharedImports } from '@shared';
import { Deal } from '../../model/deal.model';

@Component({
  selector: 'app-deal-editor',
  imports: [SharedImports],
  template: `
    <mat-card appearance="outlined">
      <mat-card-header>
        <mat-card-title>Edit Deal</mat-card-title>
      </mat-card-header>
      <mat-card-actions align="end">
        <button matButton="text" type="button" (click)="cancelled.emit()">Cancel</button>
        <button matButton="filled" type="button" (click)="saved.emit()">Save</button>
      </mat-card-actions>
    </mat-card>
  `,
})
export class DealEditor {
  // Stub: no form fields or persistence yet
  readonly deal = input<Deal>();
  readonly saved = output<void>();
  readonly cancelled = output<void>();
}
