import { Component, effect, input, output, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { form, FormField } from '@angular/forms/signals';
import { SharedForms } from '@shared';
import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs';

@Component({
  selector: 'app-contact-search-form',
  imports: [...SharedForms, FormField],
  template: `
    <form role="search" class="flex items-end gap-3" (submit)="onSubmit($event)">
      <mat-form-field class="flex-1">
        <mat-label>Search contacts</mat-label>
        <input matInput type="text" [formField]="searchForm.q" />
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

  private readonly draft = signal({ q: '' });
  protected readonly searchForm = form(this.draft);

  constructor() {
    // Mirrors the URL query into the draft (e.g. browser back)
    effect(() => this.draft.set({ q: this.initialQuery() }));

    toObservable(this.draft)
      .pipe(
        map((draft) => draft.q.trim()),
        debounceTime(300),
        distinctUntilChanged(),
        filter((q) => q !== this.initialQuery()), // already in the URL
        takeUntilDestroyed(),
      )
      .subscribe((q) => this.queryChange.emit(q));
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.queryChange.emit(this.draft().q.trim());
  }
}
