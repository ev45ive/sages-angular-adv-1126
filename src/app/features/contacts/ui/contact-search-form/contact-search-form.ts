import { Component, input, linkedSignal, output } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { form, FormField } from '@angular/forms/signals';
import { SharedForms } from '@shared';
import { debounceTime, distinctUntilChanged, map, skip } from 'rxjs';

@Component({
  selector: 'app-contact-search-form',
  imports: [...SharedForms, FormField],
  template: `
    <form role="search" class="flex items-end gap-3" (submit)="onSubmit($event)">
      <mat-form-field class="flex-1">
        <mat-label>Search contacts</mat-label>
        <input matInput type="search" [formField]="searchForm.q" />
      </mat-form-field>
      <button matButton="filled" type="submit">Search</button>
    </form>
  `,
  host: {
    class: 'block',
  },
})
export class ContactSearchForm {
  readonly initialQuery = input<string>('');
  readonly queryChange = output<string>();

  // Resets when the URL query changes (e.g. browser back)
  private readonly draft = linkedSignal(() => ({ q: this.initialQuery() }));
  protected readonly searchForm = form(this.draft);

  constructor() {
    toObservable(this.draft)
      .pipe(
        map((draft) => draft.q.trim()),
        debounceTime(300),
        distinctUntilChanged(),
        skip(1), // first value is the initial query, already in the URL
        takeUntilDestroyed(),
      )
      .subscribe((q) => this.queryChange.emit(q));
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.queryChange.emit(this.draft().q.trim());
  }
}
