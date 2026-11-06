import {
  Component,
  computed,
  effect,
  inject,
  signal,
  SimpleChanges,
  viewChild,
} from '@angular/core';
import { MasterDetailLayout, NeverPipe, SharedModule } from '@shared';
import { DealsStore } from '../../data/deals.store';
import { Deal } from '../../model/deal.model';
import { TaskPriority } from '../../model/deal-task.model';
import { DealDetailsCard } from '../../ui/deal-details-card/deal-details-card';
import { DealEditor, IHaveUnsavedChanges } from '../../ui/deal-editor/deal-editor';
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
    NeverPipe,
  ],
  template: `
    <main class="bg-surface text-on-surface">
      <app-master-detail-layout>
        <!-- --- -->
        <app-deal-master-list
          appMasterDetailList
          [deals]="filteredDeals()"
          [selectedId]="selectedDealId()"
          (dealSelected)="onSelectDeal($event)"
        >
          <ng-container *appDealItemTpl="let deal; selected as isSelected">
            <app-deal-list-item [deal]="deal" [selected]="isSelected" />
          </ng-container>

          <app-deals-filter app-master-list-header [(value)]="filterText" />
          <button
            app-master-list-footer
            matButton="outlined"
            type="button"
            (click)="onCreateDeal()"
          >
            Create new
          </button>
        </app-deal-master-list>

        @if (error()) {
          <p class="text-red-500">{{ error()?.message }}</p>
        }
        @if (isLoading()) {
          <p class="text-blue-500">Loading ...</p>
        }

        @let mode = viewMode();

        @if (mode === 'details') {
          <div>
            <app-deal-details-card [deal]="selectedDeal()" (editRequested)="onEditDeal()">
              <!-- <div empty-state>No deals found </div> -->
            </app-deal-details-card>
            <app-deal-tasks-card
              class="mt-4"
              [tasks]="selectedTasks()"
              (taskAdded)="addTask(selectedDealId()!, $event)"
              (taskToggled)="toggleTask($event)"
              (archiveCompletedRequested)="onArchiveCompleted()"
            />
          </div>
        } @else if (mode === 'editor') {
          <app-deal-editor
            #editorRef
            [deal]="selectedDeal()"
            [tasks]="selectedTasks()"
            (saved)="onSaveDeal()"
            (cancelled)="onCancelEdit()"
          />
        } @else if (mode === 'creator') {
          <app-deal-editor #editorRef (saved)="onSaveNewDeal()" (cancelled)="onCancelEdit()" />
        } @else {
          {{ mode | never: 'Invalid View Mode' }}
        }
      </app-master-detail-layout>
    </main>
  `,
  providers: [DealsStore], // Components (Type) lifecycle
})
export class DealsPage {
  // private readonly store = new DealsStore(new DealsAPI( new DealsConfig() )); // Concrete Coupling
  private readonly store = inject(DealsStore); // Abstract Dependency

  // protected readonly viewMode = signal<DealViewMode>('details');
  protected readonly viewMode = signal<'details' | 'editor' | 'creator'>('details');

  protected readonly filterText = signal('');
  protected readonly selectedDealId = signal<string | null>(null);

  error = signal<Error | null>(null);
  isLoading = signal<boolean>(false);
  deals = signal<Deal[]>([]);

  filteredDeals = computed(() => this.deals());

  // protected readonly filteredDeals = computed(() => {
  //   return this.store.filterDeals(this.filterText());
  // });

  selectedDeal = signal<Deal | undefined>(undefined);

  private loadSelectedDeal = effect(async () => {
    const id = this.selectedDealId();
    if (!id) return;

    const deal = await this.store.fetchDealById(id);
    // loading / error ?

    this.selectedDeal.set(deal)
  });

  private onInit = effect(() => {
    this.isLoading.set(true);

    const query = this.filterText();

    this.store
      .fetchDeals(query)
      .then((data) => this.deals.set(data))
      .catch((e) => this.error.set(e))
      .finally(() => this.isLoading.set(false));
  });

  //
  // Angular Component Lifecycle - Chain of responsibility - walk down/up init/check
  //
  // ngOnChanges(changes: SimpleChanges): void {}
  // ngOnInit(): void {} // v- recursive walk descendants
  //   ngDoCheck(): void {}
  //     ngAfterContentInit(): void {}
  //       ngAfterViewInit(): void {} // ^- walk back ancestors
  // ngOnDestroy(): void {}

  onSaveNewDeal() {
    throw new Error('Method not implemented.');
  }

  // protected readonly selectedDeal = computed<Deal | undefined>(() =>
  //   this.filteredDeals().find((deal) => deal.id === this.selectedDealId()),
  // );

  protected readonly selectedTasks = computed(() => {
    const deal = this.selectedDeal();
    return deal ? this.store.getTasksForDeal(deal.id) : [];
  });

  editorRef = viewChild(IHaveUnsavedChanges);

  protected onSelectDeal(dealId: string | null): void {
    if (this.editorRef()?.hasUnsavedChanges()) return;

    this.selectedDealId.set(dealId);
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
