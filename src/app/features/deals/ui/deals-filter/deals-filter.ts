import { Component, effect, input, linkedSignal, output, signal } from '@angular/core';
import { SharedModule } from '@shared';

const FILTER_DEBOUNCE_MS = 300;

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
        [value]="text()"
        (input)="onInput(filterInput.value)"
      />
      <mat-icon matSuffix aria-hidden="true">search</mat-icon>
    </mat-form-field>
  `,
  host: { class: 'block' },
})
export class DealsFilter {
  readonly value = input('');
  readonly debouncedChange = output<string>();

  protected readonly text = linkedSignal(() => this.value());

  // null skips the initial run so the URL value is not overwritten
  private readonly pendingText = signal<string | null>(null);

  constructor() {
    effect((onCleanup) => {
      const text = this.pendingText();
      if (text === null) return;

      const timerId = setTimeout(() => this.debouncedChange.emit(text), FILTER_DEBOUNCE_MS);
      onCleanup(() => clearTimeout(timerId));
    });
  }

  protected onInput(text: string): void {
    this.text.set(text);
    this.pendingText.set(text);
  }
}
