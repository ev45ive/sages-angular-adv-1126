import { Component, inject, input, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HasUnsavedChanges } from '@shared';
import { DEAL_EDIT_SOURCE, TASKS_COMMANDS, TASKS_READER } from '../../data/deals.ports';
import { injectContactLookup } from '../../data/inject-contact-lookup';
import { DealEditor, DealEditorValue, toDealDraft } from '../../ui/deal-editor/deal-editor';

@Component({
  imports: [DealEditor],
  selector: 'app-deal-edit-page',
  template: `
    @if (error(); as message) {
      <p role="alert" class="mb-2 text-body-md text-error">{{ message }}</p>
    }
    @if (deal(); as value) {
      <app-deal-editor
        [deal]="value"
        [tasks]="tasks()"
        [saving]="saving()"
        [contactOptions]="contact.options()"
        [contactLabel]="contact.label() ?? ''"
        [contactLoading]="contact.loading()"
        (contactSearch)="contact.search($event)"
        (saved)="onSaved($event)"
        (cancelled)="goToDetails()"
      />
    }
  `,
})
export class DealEditPage implements HasUnsavedChanges {
  private readonly source = inject(DEAL_EDIT_SOURCE);
  private readonly tasksReader = inject(TASKS_READER);
  private readonly tasksCommands = inject(TASKS_COMMANDS);
  private readonly router = inject(Router);

  // Bound from the :dealId route param (withComponentInputBinding)
  readonly dealId = input.required<string>();

  private readonly editor = viewChild(DealEditor);

  protected readonly deal = this.source.selectDealById(this.dealId);
  protected readonly saving = this.source.selectLoadingById(this.dealId);
  protected readonly error = this.source.selectError;
  protected readonly tasks = this.tasksReader.selectTasksByDealId(this.dealId);
  protected readonly contact = injectContactLookup(() => this.deal()?.contactId);

  constructor() {
    this.source.loadDeal(this.dealId);
    this.tasksCommands.loadTasksForDeal(this.dealId);
  }

  hasUnsavedChanges(): boolean {
    return this.editor()?.hasUnsavedChanges() ?? false;
  }

  protected onSaved(value: DealEditorValue): void {
    this.source.updateDeal({
      id: this.dealId(),
      changes: toDealDraft(value),
      onSaved: () => {
        this.editor()?.markPristine();
        this.goToDetails();
      },
    });
  }

  protected goToDetails(): void {
    void this.router.navigate(['/deals', this.dealId()], { queryParamsHandling: 'preserve' });
  }
}
