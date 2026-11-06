import { Component, inject, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HasUnsavedChanges } from '@shared';
import { DEAL_CREATE_SOURCE } from '../../data/deals.ports';
import { injectContactLookup } from '../../data/inject-contact-lookup';
import { DealEditor, DealEditorValue, toDealDraft } from '../../ui/deal-editor/deal-editor';

/**
 * Routed page of `/deals/new`.
 * - **What:** container reusing `DealEditor` for creation, without tasks (they need a saved deal).
 * - **Why:** creation is a route with its own guard, symmetrical to edit.
 */
@Component({
  imports: [DealEditor],
  selector: 'app-deal-create-page',
  template: `
    @if (error(); as message) {
      <p role="alert" class="mb-2 text-body-md text-error">{{ message }}</p>
    }
    <app-deal-editor
      heading="New Deal"
      [showTasks]="false"
      [saving]="creating()"
      [contactOptions]="contact.options()"
      [contactLoading]="contact.loading()"
      (contactSearch)="contact.search($event)"
      (saved)="onSaved($event)"
      (cancelled)="onCancel()"
    />
  `,
})
export class DealCreatePage implements HasUnsavedChanges {
  private readonly source = inject(DEAL_CREATE_SOURCE);
  private readonly router = inject(Router);

  private readonly editor = viewChild(DealEditor);

  protected readonly creating = this.source.creating;
  protected readonly error = this.source.selectError;
  protected readonly contact = injectContactLookup(() => undefined);

  hasUnsavedChanges(): boolean {
    return this.editor()?.hasUnsavedChanges() ?? false;
  }

  protected onSaved(value: DealEditorValue): void {
    this.source.createDeal({
      draft: toDealDraft(value),
      onCreated: (deal) => {
        this.editor()?.markPristine();
        void this.router.navigate(['/deals', deal.id], { queryParamsHandling: 'preserve' });
      },
    });
  }

  protected onCancel(): void {
    void this.router.navigate(['/deals'], { queryParamsHandling: 'preserve' });
  }
}
