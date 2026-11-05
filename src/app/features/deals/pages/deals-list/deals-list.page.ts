import { Component, computed, inject, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { MasterDetailLayout, SharedImports } from '../../../../shared';
import { DealsStore } from '../../data/deals.store';
import { Deal, DEAL_STAGE_LABELS } from '../../model/deal.model';
import { TASK_PRIORITY_LABELS, TaskPriority } from '../../model/deal-task.model';

interface NewTaskDraft {
  title: string;
  priority: TaskPriority;
}

const emptyTask = (): NewTaskDraft => ({ title: '', priority: 'medium' });

@Component({
  selector: 'app-deals-page',
  imports: [
    // SharedModule,
    SharedImports,
    MasterDetailLayout,
    FormField,
  ],
  styles: [
    `
      mat-chip-set {
        display: flex !important;
      }
    `,
  ],
  template: `
    <main class="bg-surface text-on-surface">
      <app-master-detail-layout>
        <aside appMasterDetailList>
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

          <mat-list class="mt-3">
            @for (deal of filteredDeals(); track deal.id) {
              <button
                mat-list-item
                type="button"
                [attr.aria-current]="deal.id === selectedDeal()?.id ? 'true' : null"
                [activated]="deal.id === selectedDeal()?.id"
                (click)="selectedDealId.set(deal.id)"
              >
                <span matListItemTitle>{{ deal.title }} — {{ accountName(deal.accountId) }}</span>
                <span matListItemLine>
                  {{ deal.value.amount | currency: deal.value.currency : 'symbol' : '1.0-0' }}
                </span>
                <mat-chip-set matListItemMeta>
                  <mat-chip>{{ stageLabels[deal.stage] }}</mat-chip>
                </mat-chip-set>
              </button>
            }
          </mat-list>
        </aside>

        @if (selectedDeal(); as deal) {
          <div>
            <mat-card appearance="outlined">
              <mat-card-header>
                <mat-card-title
                  >{{ deal.title }} — {{ accountName(deal.accountId) }}</mat-card-title
                >
                <mat-card-subtitle>{{ deal.summary }}</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <mat-chip-set class="special-chip-override">
                  <mat-chip>{{ stageLabels[deal.stage] }}</mat-chip>
                </mat-chip-set>
                <dl class="mt-4 grid grid-cols-3 gap-4 text-body-md">
                  <div>
                    <dt class="meta">Value</dt>
                    <dd class="mt-1 text-title-sm">
                      {{ deal.value.amount | currency: deal.value.currency : 'symbol' : '1.0-0' }}
                    </dd>
                  </div>
                  <div>
                    <dt class="meta">Contact</dt>
                    <dd class="mt-1 text-title-sm">{{ contactName(deal.contactId) }}</dd>
                  </div>
                  <div>
                    <dt class="meta">Public</dt>
                    <dd class="mt-1 text-title-sm">{{ deal.isPublic ? 'Yes' : 'No' }}</dd>
                  </div>
                </dl>
              </mat-card-content>
              <mat-card-actions align="end">
                <button matButton="outlined" type="button">Edit</button>
              </mat-card-actions>
            </mat-card>

            <mat-card appearance="outlined" class="mt-4">
              <mat-card-header>
                <mat-card-title>Tasks</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="flex items-end gap-3">
                  <mat-form-field class="flex-1">
                    <mat-label>New task</mat-label>
                    <input matInput type="text" [formField]="taskForm.title" />
                  </mat-form-field>
                  <mat-form-field class="w-36">
                    <mat-label>Priority</mat-label>
                    <mat-select [formField]="taskForm.priority">
                      @for (priority of priorities; track priority) {
                        <mat-option [value]="priority">{{ priorityLabels[priority] }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>
                  <button matButton="filled" type="button" (click)="addTask(deal.id)">Add</button>
                </div>

                <mat-list class="mt-4">
                  @for (task of selectedTasks(); track task.id) {
                    <mat-list-item>
                      <mat-checkbox
                        matListItemIcon
                        [checked]="task.done"
                        (change)="toggleTask(task.id)"
                        [attr.aria-label]="
                          'Mark ' + task.title + (task.done ? ' as not done' : ' as done')
                        "
                      />
                      <span matListItemTitle [class.line-through]="task.done">{{
                        task.title
                      }}</span>
                      @if (task.dueDate) {
                        <span matListItemLine>Due: {{ task.dueDate }}</span>
                      }
                      <mat-chip-set matListItemMeta>
                        <mat-chip>{{ priorityLabels[task.priority] }}</mat-chip>
                      </mat-chip-set>
                    </mat-list-item>
                  }
                </mat-list>
              </mat-card-content>
              <mat-card-actions align="end">
                <button matButton="text" type="button">Archive completed</button>
              </mat-card-actions>
            </mat-card>
          </div>
        }
      </app-master-detail-layout>
    </main>
  `,
})
export class DealsPage {
  private readonly store = inject(DealsStore);

  protected readonly stageLabels = DEAL_STAGE_LABELS;
  protected readonly priorityLabels = TASK_PRIORITY_LABELS;
  protected readonly priorities = Object.keys(TASK_PRIORITY_LABELS) as TaskPriority[];

  protected readonly filterText = signal('');
  protected readonly selectedDealId = signal<string | null>(null);

  protected readonly filteredDeals = computed(() => {
    const filterText = this.filterText();

    return this.store.filterDeals(filterText);
  });
  
  protected readonly selectedDeal = computed<Deal | undefined>(
    () =>
      this.filteredDeals().find((deal) => deal.id === this.selectedDealId()) ??
      this.filteredDeals()[0],
  );
  protected readonly selectedTasks = computed(() => {
    const deal = this.selectedDeal();
    return deal ? this.store.getTasksForDeal(deal.id) : [];
  });

  protected readonly taskDraft = signal<NewTaskDraft>(emptyTask());
  protected readonly taskForm = form(this.taskDraft);

  protected accountName(id: string): string {
    return this.store.accounts().find((account) => account.id === id)?.name ?? '';
  }

  protected contactName(id: string): string {
    return this.store.contacts().find((contact) => contact.id === id)?.fullName ?? '';
  }

  protected addTask(dealId: string): void {
    const { title, priority } = this.taskDraft();
    if (!title.trim()) return;
    this.store.addTask(dealId, title.trim(), priority);
    this.taskDraft.set(emptyTask());
  }

  protected toggleTask(taskId: string): void {
    this.store.toggleTaskDone(taskId);
  }
}
