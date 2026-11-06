import {
  Component,
  effect,
  InjectionToken,
  input,
  linkedSignal,
  output,
  untracked,
} from '@angular/core';
import {
  applyEach,
  FieldValidator,
  form,
  FormField,
  maxLength,
  min,
  minLength,
  required,
  SchemaPathTree,
  submit,
  validate,
} from '@angular/forms/signals';
import { SharedImports } from '@shared';
import { Deal, DEAL_STAGE_LABELS, DealStage } from '../../model/deal.model';
import { DealTask, TASK_PRIORITY_LABELS, TaskPriority } from '../../model/deal-task.model';

export interface IHaveUnsavedChanges {
  hasUnsavedChanges(): boolean;
}
export const IHaveUnsavedChanges = new InjectionToken<IHaveUnsavedChanges>('IHaveUnsavedChanges');

export interface DealEditorValue {
  title: string;
  summary: string;
  stage: DealStage;
  amount: number;
  isPublic: boolean;
  tasks: { title: string; priority: TaskPriority }[];
}

const FORBIDDEN_NAMES = ['admin', 'root', 'test'];

export function forbiddenNames(names: readonly string[]): FieldValidator<string> {
  const blocked = new Set(names.map((name) => name.toLowerCase()));
  return ({ value }) =>
    blocked.has(value().trim().toLowerCase())
      ? { kind: 'forbiddenName', message: 'This name is not allowed' }
      : null;
}

function dealSchema(p: SchemaPathTree<DealEditorValue>): void {
  required(p.title, { message: 'Title is required' });
  minLength(p.title, 3, { message: 'At least 3 characters' });
  maxLength(p.title, 100, { message: 'Max 100 characters' });
  validate(p.title, forbiddenNames(FORBIDDEN_NAMES));

  required(p.amount, { message: 'Value is required' });
  min(p.amount, 0, { message: 'Value cannot be negative' });

  applyEach(p.tasks, (task) => {
    required(task.title, { message: 'Title is required' });
    minLength(task.title, 3, { message: 'At least 3 characters' });
    validate(task.title, forbiddenNames(FORBIDDEN_NAMES));
  });
}

function toValue(deal: Deal | undefined, tasks: readonly DealTask[]): DealEditorValue {
  return {
    title: deal?.title ?? '',
    summary: deal?.summary ?? '',
    stage: deal?.stage ?? 'new',
    amount: deal?.value.amount ?? 0,
    isPublic: deal?.isPublic ?? false,
    tasks: tasks.map((task) => ({ title: task.title, priority: task.priority })),
  };
}

function emptyTask(): DealEditorValue['tasks'][number] {
  return { title: '', priority: 'medium' };
}

@Component({
  selector: 'app-deal-editor',
  imports: [SharedImports, FormField],
  template: `
    <form (ngSubmit)="onSubmit()">
      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title>Edit Deal</mat-card-title>
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
            <mat-form-field>
              <mat-label>Contact</mat-label>
              <input matInput type="text" />
            </mat-form-field>
            <mat-form-field class="md:col-span-2">
              <mat-label>Description</mat-label>
              <textarea matInput rows="4" [formField]="dealForm.summary"></textarea>
            </mat-form-field>
          </div>

          <mat-checkbox class="mt-4" [formField]="dealForm.isPublic">Public deal</mat-checkbox>

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
        </mat-card-content>
        <mat-card-actions align="end">
          <button matButton="text" type="button" (click)="cancelled.emit()">Cancel</button>
          <button matButton="filled" type="submit">Save</button>
        </mat-card-actions>
      </mat-card>
    </form>
  `,
  providers: [{ provide: IHaveUnsavedChanges, useExisting: DealEditor }],
})
export class DealEditor implements IHaveUnsavedChanges {
  readonly deal = input<Deal>();
  readonly tasks = input<readonly DealTask[]>([]);

  readonly saved = output<DealEditorValue>();
  readonly cancelled = output<void>();

  private readonly model = linkedSignal(() => toValue(this.deal(), this.tasks()));
  protected readonly dealForm = form(this.model, dealSchema);

  protected readonly stages = Object.keys(DEAL_STAGE_LABELS) as DealStage[];
  protected readonly stageLabels = DEAL_STAGE_LABELS;
  protected readonly priorities = Object.keys(TASK_PRIORITY_LABELS) as TaskPriority[];
  protected readonly priorityLabels = TASK_PRIORITY_LABELS;

  constructor() {
    // Tracks only the inputs, so user edits do not clear dirty state.
    effect(() => {
      this.deal();
      this.tasks();
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
}

export type PartialPartial<T, F extends keyof T> = Omit<T, F> & Partial<Pick<T, F>>;

export type DealFormDraft = PartialPartial<Deal, 'id' | 'accountId' | 'contactId'>;

export function emptyDeal(): DealFormDraft {
  return {
    title: '',
    summary: '',
    stage: 'new',
    value: { amount: 0, currency: 'USD' },
    isPublic: false,
  };
}
