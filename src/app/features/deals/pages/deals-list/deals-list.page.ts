import { Component, computed, inject, signal } from '@angular/core';
import { MasterDetailLayout, SharedModule } from '@shared';
import { DealsStore } from '../../data/deals.store';
import { Deal } from '../../model/deal.model';
import { TaskPriority } from '../../model/deal-task.model';
import { DealDetailsCard } from '../../ui/deal-details-card/deal-details-card';
import { DealEditor } from '../../ui/deal-editor/deal-editor';
import { DealMasterList } from '../../ui/deal-master-list/deal-master-list';
import { DealTasksCard } from '../../ui/deal-tasks-card/deal-tasks-card';
import { DealListItem } from '../../ui/deal-list-item/deal-list-item';

type DealViewMode = 'details' | 'editor' | 'creator';

@Component({
  selector: 'app-deals-page',
  imports: [
    MasterDetailLayout,
    DealMasterList,
    DealDetailsCard,
    DealTasksCard,
    DealEditor,
    SharedModule,
    DealListItem,
  ],
  template: `
    <main class="bg-surface text-on-surface">
      <app-master-detail-layout>
        <app-deal-master-list appMasterDetailList [deals]="filteredDeals()">
          <!-- ng-template - parent prepares, child is creating with context -->
          <ng-template #listItem let-deal let-monkey="banana">
            <app-deal-list-item
              [deal]="deal"
              [selected]="deal.id === selectedDeal()?.id"
              (dealSelected)="onSelectDeal($event)"
            />
          </ng-template>

          <!-- ng-content - parent creates, child presents -->
          <ng-container app-master-list-header>
            <mat-form-field class="w-full">
              <mat-label>Filter deals</mat-label>
              <input
                matInput
                type="search"
                #filterInput
                (input)="filterText.set(filterInput.value)"
              />
              <mat-icon matSuffix aria-hidden="true">search</mat-icon>
            </mat-form-field>

            <button matButton="outlined" type="button" (click)="onCreateDeal()">Create new</button>
          </ng-container>
        </app-deal-master-list>

        @if (viewMode() === 'details') {
          @if (selectedDeal(); as deal) {
            <div>
              <app-deal-details-card [deal]="deal" (editRequested)="onEditDeal()" />
              <app-deal-tasks-card
                class="mt-4"
                [tasks]="selectedTasks()"
                (taskAdded)="addTask(deal.id, $event)"
                (taskToggled)="toggleTask($event)"
                (archiveCompletedRequested)="onArchiveCompleted()"
              />
            </div>
          } @else {
            <p>Select a deal</p>
          }
        } @else if (viewMode() === 'editor') {
          <app-deal-editor
            [deal]="selectedDeal()"
            (saved)="onSaveDeal()"
            (cancelled)="onCancelEdit()"
          />
        } @else if (viewMode() === 'creator') {
          <app-deal-editor (saved)="onSaveNewDeal()" (cancelled)="onCancelEdit()" />
        }
      </app-master-detail-layout>
    </main>
  `,
  providers: [DealsStore], // Components (Type) lifecycle
})
export class DealsPage {
  onSaveNewDeal() {
    throw new Error('Method not implemented.');
  }
  // private readonly store = new DealsStore(new DealsAPI( new DealsConfig() )); // Concrete Coupling
  private readonly store = inject(DealsStore); // Abstract Dependency

  protected readonly viewMode = signal<DealViewMode>('details');

  protected readonly filterText = signal('');
  protected readonly selectedDealId = signal<string | null>(null);

  protected readonly filteredDeals = computed(() => {
    return this.store.filterDeals(this.filterText());
  });

  protected readonly selectedDeal = computed<Deal | undefined>(() =>
    this.filteredDeals().find((deal) => deal.id === this.selectedDealId()),
  );
  protected readonly selectedTasks = computed(() => {
    const deal = this.selectedDeal();
    return deal ? this.store.getTasksForDeal(deal.id) : [];
  });

  protected onSelectDeal(dealId: string): void {
    this.selectedDealId.set(dealId);
    this.viewMode.set('details');
  }

  protected onCreateDeal(): void {
    this.viewMode.set('creator');
  }

  protected onEditDeal(): void {
    this.viewMode.set('editor');
  }

  protected onCancelEdit(): void {
    this.viewMode.set('details');
  }

  protected onSaveDeal(): void {
    // TODO: persist the saved deal
    this.viewMode.set('details');
  }

  protected onArchiveCompleted(): void {
    // TODO: archive completed tasks
  }

  protected addTask(dealId: string, task: { title: string; priority: TaskPriority }): void {
    this.store.addTask(dealId, task.title, task.priority);
  }

  protected toggleTask(taskId: string): void {
    this.store.toggleTaskDone(taskId);
  }
}
