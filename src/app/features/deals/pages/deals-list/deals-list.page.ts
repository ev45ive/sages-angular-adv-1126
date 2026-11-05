import { Component, computed, inject, signal } from '@angular/core';
import { MasterDetailLayout, SharedModule } from '@shared';
import { DealsStore } from '../../data/deals.store';
import { Deal } from '../../model/deal.model';
import { TaskPriority } from '../../model/deal-task.model';
import { DealDetailsCard } from '../../ui/deal-details-card/deal-details-card';
import { DealEditor } from '../../ui/deal-editor/deal-editor';
import { DealItemTpl } from '../../ui/deal-item-tpl/deal-item-tpl';
import { DealListItem } from '../../ui/deal-list-item/deal-list-item';
import { DealMasterList } from '../../ui/deal-master-list/deal-master-list';
import { DealTasksCard } from '../../ui/deal-tasks-card/deal-tasks-card';
import { DealsFilter } from '../../ui/deals-filter/deals-filter';

type DealViewMode = 'details' | 'editor' | 'creator';

@Component({
  selector: 'app-deals-page',
  imports: [
    MasterDetailLayout,
    DealMasterList,
    DealListItem,
    DealItemTpl,
    DealDetailsCard,
    DealTasksCard,
    DealEditor,
    DealsFilter,
    SharedModule,
  ],
  template: `
    <main class="bg-surface text-on-surface">
      <app-master-detail-layout>
        <!-- --- -->
        <app-deal-master-list
          appMasterDetailList
          [deals]="filteredDeals()"
          [selectedId]="selectedDeal()?.id ?? null"
          (dealSelected)="onSelectDeal($event)"
        >
          <ng-container *appDealItemTpl="let deal; let isSelected = selected">
            <app-deal-list-item [deal]="deal" [selected]="isSelected" />
          </ng-container>

          <app-deals-filter app-master-list-header [(value)]="filterText" />

          <button matButton="outlined" type="button" (click)="onCreateDeal()">Create new</button>
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

  protected onSelectDeal(dealId: string | null): void {
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
