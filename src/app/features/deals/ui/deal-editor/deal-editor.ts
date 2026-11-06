import { Component, computed, effect, input, linkedSignal, output, untracked } from '@angular/core';
import {
  form,
  FormField,
  SchemaPathTree,
  submit,
  validateStandardSchema,
} from '@angular/forms/signals';
import { HasUnsavedChanges, SharedImports } from '@shared';
import { z } from 'zod';
import { ContactOption } from '../../data/contact-directory.port';
import { Deal, DEAL_STAGE_LABELS, DealDraft, DealStage } from '../../model/deal.model';
import { DealTask, TASK_PRIORITY_LABELS, TaskPriority } from '../../model/deal-task.model';
import { ContactPicker } from '../contact-picker/contact-picker';

export interface DealEditorValue {
  title: string;
  summary: string;
  stage: DealStage;
  amount: number;
  contactId: string;
  isPublic: boolean;
  tasks: { title: string; priority: TaskPriority }[];
}

const FORBIDDEN_NAMES = ['admin', 'root', 'test'];

const notForbidden = (value: string): boolean =>
  !FORBIDDEN_NAMES.includes(value.trim().toLowerCase());

const dealZod = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .min(3, 'At least 3 characters')
    .max(100, 'Max 100 characters')
    .refine(notForbidden, 'This name is not allowed'),
  amount: z.number({ error: 'Value is required' }).min(0, 'Value cannot be negative'),
  contactId: z.string().min(1, 'Contact is required'),
  tasks: z.array(
    z.object({
      title: z
        .string()
        .min(1, 'Title is required')
        .min(3, 'At least 3 characters')
        .refine(notForbidden, 'This name is not allowed'),
    }),
  ),
});

function dealSchema(p: SchemaPathTree<DealEditorValue>): void {
  validateStandardSchema(p, dealZod);
}

function toValue(deal: Deal | undefined, tasks: readonly DealTask[]): DealEditorValue {
  return {
    title: deal?.title ?? '',
    summary: deal?.summary ?? '',
    stage: deal?.stage ?? 'new',
    amount: deal?.value.amount ?? 0,
    contactId: deal?.contactId ?? '',
    isPublic: deal?.isPublic ?? false,
    tasks: tasks.map((task) => ({ title: task.title, priority: task.priority })),
  };
}

function emptyTask(): DealEditorValue['tasks'][number] {
  return { title: '', priority: 'medium' };
}

@Component({
  selector: 'app-deal-editor',
  imports: [SharedImports, FormField, ContactPicker],
  template: `
    <form (ngSubmit)="onSubmit()">
      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title>{{ heading() }}</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <mat-form-field>
              <mat-label>Title</mat-label>
              <input matInput type="text" [formField]="dealForm.title" />
              <mat-error>{{ dealForm.title().errors()[0]?.message }}</mat-error>
              <mat-hint align="end">{{ dealForm.title().value().length }} / 100</mat-hint>
            </mat-form-field>
            <mat-form-field>
              <mat-label>Value ($)</mat-label>
              <input matInput type="number" [formField]="dealForm.amount" />
              <mat-error>{{ dealForm.amount().errors()[0]?.message }}</mat-error>
            </mat-form-field>
            <mat-form-field>
              <mat-label>Stage</mat-label>
              <mat-select [formField]="dealForm.stage">
                @for (stage of stages; track stage) {
                  <mat-option [value]="stage">{{ stageLabels[stage] }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
            <app-contact-picker
              [formField]="dealForm.contactId"
              [options]="contactOptions()"
              [selectedLabel]="contactLabel()"
              [loading]="contactLoading()"
              (searched)="contactSearch.emit($event)"
            />
            <mat-form-field class="md:col-span-2">
              <mat-label>Description</mat-label>
              <textarea matInput rows="4" [formField]="dealForm.summary"></textarea>
            </mat-form-field>
          </div>

          <mat-checkbox class="mt-4" [formField]="dealForm.isPublic">Public deal</mat-checkbox>

          @if (showTasks()) {
            <div class="mt-6 flex items-center justify-between">
              <h3 class="font-medium">Tasks</h3>
              <button matButton="text" type="button" (click)="addTask()">Add task</button>
            </div>

            <div class="mt-2 flex flex-col gap-3">
              @for (task of dealForm.tasks; track $index; let i = $index) {
                <div class="grid grid-cols-1 items-start gap-3 md:grid-cols-[1fr_10rem_auto]">
                  <mat-form-field>
                    <mat-label>Task title</mat-label>
                    <input matInput type="text" [formField]="task.title" />
                    <mat-error>{{ task.title().errors()[0]?.message }}</mat-error>
                  </mat-form-field>
                  <mat-form-field>
                    <mat-label>Priority</mat-label>
                    <mat-select [formField]="task.priority">
                      @for (priority of priorities; track priority) {
                        <mat-option [value]="priority">{{ priorityLabels[priority] }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>
                  <button matButton="text" type="button" class="mt-2" (click)="removeTask(i)">
                    Remove
                  </button>
                </div>
              } @empty {
                <p class="text-sm">No tasks yet</p>
              }
            </div>
          }
        </mat-card-content>
        <mat-card-actions align="end">
          <button matButton="text" type="button" (click)="cancelled.emit()">Cancel</button>
          <button matButton="filled" type="submit" [disabled]="saving()">Save</button>
        </mat-card-actions>
      </mat-card>
    </form>
  `,
})
export class DealEditor implements HasUnsavedChanges {
  readonly deal = input<Deal>();
  readonly tasks = input<readonly DealTask[]>([]);
  readonly heading = input('Edit Deal');
  // Tasks need a saved deal, so the create page turns them off
  readonly showTasks = input(true);
  readonly saving = input(false);
  readonly contactOptions = input<readonly ContactOption[]>([]);
  readonly contactLabel = input('');
  readonly contactLoading = input(false);

  readonly saved = output<DealEditorValue>();
  readonly cancelled = output<void>();
  readonly contactSearch = output<string>();

  // Compared by content: a late response with unchanged data must not wipe what the user typed
  private readonly source = computed(() => toValue(this.deal(), this.tasks()), {
    equal: (a, b) => JSON.stringify(a) === JSON.stringify(b),
  });
  private readonly model = linkedSignal(() => this.source());
  protected readonly dealForm = form(this.model, dealSchema);

  protected readonly stages = Object.keys(DEAL_STAGE_LABELS) as DealStage[];
  protected readonly stageLabels = DEAL_STAGE_LABELS;
  protected readonly priorities = Object.keys(TASK_PRIORITY_LABELS) as TaskPriority[];
  protected readonly priorityLabels = TASK_PRIORITY_LABELS;

  constructor() {
    // Tracks only the inputs, so user edits do not clear dirty state.
    effect(() => {
      this.source();
      untracked(() => this.dealForm().reset());
    });
  }

  protected onSubmit(): void {
    void submit(this.dealForm, async () => {
      this.saved.emit(this.model());
    });
  }

  protected addTask(): void {
    this.model.update((value) => ({ ...value, tasks: [...value.tasks, emptyTask()] }));
    this.dealForm().markAsDirty();
  }

  protected removeTask(index: number): void {
    this.model.update((value) => ({
      ...value,
      tasks: value.tasks.filter((_, i) => i !== index),
    }));
    this.dealForm().markAsDirty();
  }

  hasUnsavedChanges(): boolean {
    return this.dealForm().dirty();
  }

  /**
   * Lets the parent leave the page right after saving.
   * - **Why:** the form is only reset asynchronously, so without this the unsaved-changes guard would still see a dirty form.
   */
  markPristine(): void {
    this.dealForm().reset();
  }
}

/**
 * Maps the editor's flat form value to a domain `DealDraft`.
 * - **Why:** the form model is shaped for inputs (`amount`, `tasks`); stores and APIs only know the domain model.
 */
export function toDealDraft(value: DealEditorValue): DealDraft {
  return {
    title: value.title,
    summary: value.summary,
    stage: value.stage,
    value: { amount: value.amount, currency: 'USD' },
    contactId: value.contactId,
    isPublic: value.isPublic,
  };
}
