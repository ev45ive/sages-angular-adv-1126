import { Component, effect, input, linkedSignal, model, output, signal } from '@angular/core';
import { FormValueControl, ValidationError } from '@angular/forms/signals';
import { SharedForms } from '@shared';
import { ContactOption } from '../../data/contact-directory.port';

const SEARCH_DEBOUNCE_MS = 300;

/**
 * Contact autocomplete usable as a Signal Forms control.
 * - **What:** implements `FormValueControl<string>`, so `[formField]` binds it like a native input; `value` is the picked contact id.
 * - **Why:** presentational: options and the selected label come from the parent page via `CONTACT_DIRECTORY`, so the picker does not know the contacts feature.
 */
@Component({
  imports: [...SharedForms],
  selector: 'app-contact-picker',
  styles: `
    :host {
      display: block;
    }
  `,
  template: `
    <mat-form-field class="w-full">
      <mat-label>Contact</mat-label>
      <input
        matInput
        type="text"
        autocomplete="off"
        [matAutocomplete]="auto"
        [value]="text()"
        [disabled]="disabled()"
        [attr.aria-invalid]="invalid()"
        (input)="onInput($event)"
        (focus)="searched.emit(text().trim())"
        (blur)="touch.emit()"
      />
      <mat-autocomplete
        #auto="matAutocomplete"
        [displayWith]="displayLabel"
        (optionSelected)="value.set($event.option.value)"
      >
        @for (option of options(); track option.id) {
          <mat-option [value]="option.id">
            {{ option.label }}
            @if (option.description) {
              <span class="ml-2 text-body-sm text-on-surface-variant">{{
                option.description
              }}</span>
            }
          </mat-option>
        }
      </mat-autocomplete>
      @if (loading()) {
        <mat-hint>Searching ...</mat-hint>
      }
    </mat-form-field>
    @if (touched() && errors()[0]; as error) {
      <p role="alert" class="px-4 text-body-sm text-error">{{ error.message }}</p>
    }
  `,
})
export class ContactPicker implements FormValueControl<string> {
  readonly value = model('');
  readonly errors = input<readonly ValidationError.WithOptionalFieldTree[]>([]);
  readonly disabled = input(false);
  readonly invalid = input(false);
  readonly touched = input(false);
  readonly touch = output<void>();

  readonly options = input<readonly ContactOption[]>([]);
  // Text for the current `value`; the parent knows it, the picker only holds an id
  readonly selectedLabel = input('');
  readonly loading = input(false);
  readonly searched = output<string>();

  protected readonly text = linkedSignal(() => this.selectedLabel());

  // null skips the initial run, so opening the form does not trigger a search
  private readonly pendingQuery = signal<string | null>(null);

  protected readonly displayLabel = (id: string): string =>
    this.options().find((option) => option.id === id)?.label ?? this.selectedLabel();

  constructor() {
    effect((onCleanup) => {
      const query = this.pendingQuery();
      if (query === null) return;

      const timerId = setTimeout(() => this.searched.emit(query), SEARCH_DEBOUNCE_MS);
      onCleanup(() => clearTimeout(timerId));
    });
  }

  protected onInput(event: Event): void {
    const text = (event.target as HTMLInputElement).value;
    this.text.set(text);
    // Typing drops the picked contact until the user picks another
    this.value.set('');
    this.pendingQuery.set(text.trim());
  }
}
