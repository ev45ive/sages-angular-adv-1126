import { Component, effect, input, linkedSignal, output, signal } from '@angular/core';
import { SharedForms, SharedImports } from '@shared';
import { Deal } from '../../model/deal.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-deal-editor',
  imports: [SharedImports, FormsModule, SharedForms],
  template: `
    <mat-card appearance="outlined">
      <mat-card-header>
        <mat-card-title>Edit Deal</mat-card-title>
      </mat-card-header>

      <mat-card-content>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <mat-form-field>
            <mat-label>Title</mat-label>
            <input matInput type="text" [(ngModel)]="draft().title" />
            <mat-hint align="end">{{ draft().title.length }} / 100</mat-hint>
          </mat-form-field>
          <mat-form-field>
            <mat-label>Value ($)</mat-label>
            <input matInput type="number" />
          </mat-form-field>
          <mat-form-field>
            <mat-label>Stage</mat-label>
            <mat-select>
              <mat-option value="new">New</mat-option>
              <mat-option value="proposal">Proposal</mat-option>
              <mat-option value="negotiation">Negotiation</mat-option>
              <mat-option value="closed-won">Closed won</mat-option>
              <mat-option value="closed-lost">Closed lost</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field>
            <mat-label>Contact</mat-label>
            <input matInput type="text" />
          </mat-form-field>
          <mat-form-field class="md:col-span-2">
            <mat-label>Description</mat-label>
            <textarea matInput rows="4"></textarea>
          </mat-form-field>
        </div>
      </mat-card-content>
      <mat-card-actions align="end">
        <button matButton="text" type="button" (click)="cancelled.emit()">Cancel</button>
        <button matButton="filled" type="button" (click)="saved.emit()">Save</button>
      </mat-card-actions>

      @if (deal(); as draft) {}
    </mat-card>
  `,
})
export class DealEditor {
  // Stub: fields are unbound; no persistence yet

  readonly deal = input<Deal>(); // External Readable

  readonly draft = linkedSignal<DealFormDraft>(() =>
    // this.deal() // immutable reference - only replace! 
    structuredClone({ ...emptyDeal(), ...this.deal() }), // Mutable Copy
  );

  // readonly draft = signal<DealFormDraft>(emptyDeal()); // Private ReadWrite

  // // Async
  // _copy = effect(() => {
  //   // this.draft.set({ ...emptyDeal(), ...this.deal() }); // Money is still shared!
  //   // this.draft.set({ ...emptyDeal(), ...this.deal() }); // Money is still shared!

  //   this.draft.set(structuredClone(this.deal()!));
  // });

  readonly saved = output<void>();
  readonly cancelled = output<void>();
}

// Concrete EXAMPLE
// export type DealFormDraft = Omit<Deal, 'id' | 'accountId' | 'contactId'> &
//   Partial<Pick<Deal, 'accountId' | 'contactId'>>;

// Abstract for EXAMPLE
export type PartialPartial<T, F extends keyof T> = Omit<T, F> & Partial<Pick<T, F>>;

// Abstract Usage for EXAMPLE
export type DealFormDraft = PartialPartial<Deal, 'id' | 'accountId' | 'contactId'>;

export function emptyDeal(): DealFormDraft {
  return {
    title: '',
    summary: '',
    stage: 'new',
    value: { amount: 0, currency: 'USD' },
    isPublic: false,
  };
}
