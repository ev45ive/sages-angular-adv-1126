import {
  Component,
  effect,
  InjectionToken,
  input,
  linkedSignal,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { SharedForms, SharedImports } from '@shared';
import { Deal } from '../../model/deal.model';
import { ControlContainer, FormsModule, NgForm } from '@angular/forms';

export interface IHaveUnsavedChanges {
  hasUnsavedChanges(): boolean;
}
export const IHaveUnsavedChanges = new InjectionToken<IHaveUnsavedChanges>('IHaveUnsavedChanges');

@Component({
  selector: 'app-deal-editor',
  imports: [SharedImports, FormsModule, SharedForms],
  template: `
    <form (submit)="submit()" #formRef="ngForm">
      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title>Edit Deal</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <mat-form-field>
              <mat-label>Title</mat-label>
              <input
                matInput
                type="text"
                name="title"
                [ngModel]="deal()?.title"
                required=""
                #modelRef="ngModel"
              />
              <mat-error>
                @if (modelRef.getError('required'); as error) {
                  Field is required
                }
              </mat-error>
              <mat-hint align="end">{{ modelRef.value?.length }} / 100</mat-hint>
            </mat-form-field>
            <mat-form-field ngModelGroup="value">
              <mat-label>Value ($)</mat-label>
              <input matInput type="number" ngModel name="amount" />
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

          <pre>{{ formRef.value | json }}</pre>
        </mat-card-content>
        <mat-card-actions align="end">
          <button matButton="text" type="button" (click)="cancelled.emit()">Cancel</button>
          <button matButton="filled" type="button" (click)="saved.emit()">Save</button>
        </mat-card-actions>

        @if (deal(); as draft) {}
      </mat-card>
    </form>
  `,
  // providers: [{ provide: IHaveUnsavedChanges, useClass: CosInnegoWPrzyszloci }],
  providers: [{ provide: IHaveUnsavedChanges, useExisting: DealEditor }],
})
export class DealEditor /* implements IHaveUnsavedChanges */ {
  submit() {
    const formRef = this.formRef();
    // this.form()?.getControl('title').setValue('')

    if (!formRef || formRef?.invalid) return;
    // formRef.value;
    // formRef.valid;
    // formRef.pending
    // formRef.dirty
    // formRef.touched
    // formRef.setValue({})
    // formRef.control.patchValue({})

    const draft = formRef.value;

    debugger;
  }

  hasUnsavedChanges() {
    return !!this.formRef()?.dirty;
  }

  // form = viewChild<NgForm>('formRef');
  // form = viewChild(NgForm);

  formRef = viewChild(ControlContainer);

  readonly deal = input<Deal>(); // External Readable

  readonly saved = output<void>();
  readonly cancelled = output<void>();
}

export type PartialPartial<T, F extends keyof T> = Omit<T, F> & Partial<Pick<T, F>>;

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
