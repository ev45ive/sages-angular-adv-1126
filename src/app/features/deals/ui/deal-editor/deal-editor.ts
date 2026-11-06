import { Component, effect, inject, InjectionToken, input, output, untracked } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
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

export function forbiddenNames(names: readonly string[]): ValidatorFn {
  const blocked = new Set(names.map((name) => name.toLowerCase()));
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? '')
      .trim()
      .toLowerCase();
    return blocked.has(value) ? { forbiddenName: { value } } : null;
  };
}

const nameValidators: ValidatorFn[] = [
  Validators.required,
  Validators.minLength(3),
  forbiddenNames(FORBIDDEN_NAMES),
];
const dealTitleValidators: ValidatorFn[] = [...nameValidators, Validators.maxLength(100)];

type TaskControls = {
  title: FormControl<string>;
  priority: FormControl<TaskPriority>;
};

@Component({
  selector: 'app-deal-editor',
  imports: [SharedImports],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()">
      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title>Edit Deal</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <mat-form-field>
              <mat-label>Title</mat-label>
              <input matInput type="text" formControlName="title" />
              <mat-error>
                @if (title.hasError('required')) {
                  Title is required
                } @else if (title.hasError('minlength')) {
                  At least 3 characters
                } @else if (title.hasError('forbiddenName')) {
                  This name is not allowed
                } @else if (title.hasError('maxlength')) {
                  Max 100 characters
                }
              </mat-error>
              <mat-hint align="end">{{ title.value.length }} / 100</mat-hint>
            </mat-form-field>
            <mat-form-field>
              <mat-label>Value ($)</mat-label>
              <input matInput type="number" formControlName="amount" />
              <mat-error>
                @if (amount.hasError('required')) {
                  Value is required
                } @else if (amount.hasError('min')) {
                  Value cannot be negative
                }
              </mat-error>
            </mat-form-field>
            <mat-form-field>
              <mat-label>Stage</mat-label>
              <mat-select formControlName="stage">
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
              <textarea matInput rows="4" formControlName="summary"></textarea>
            </mat-form-field>
          </div>

          <mat-checkbox class="mt-4" formControlName="isPublic">Public deal</mat-checkbox>

          <div class="mt-6 flex items-center justify-between">
            <h3 class="font-medium">Tasks</h3>
            <button matButton="text" type="button" (click)="addTask()">Add task</button>
          </div>

          <div formArrayName="tasks" class="mt-2 flex flex-col gap-3">
            @for (row of taskRows.controls; track row; let i = $index) {
              @let taskTitle = row.controls.title;
              <div
                [formGroupName]="i"
                class="grid grid-cols-1 items-start gap-3 md:grid-cols-[1fr_10rem_auto]"
              >
                <mat-form-field>
                  <mat-label>Task title</mat-label>
                  <input matInput type="text" formControlName="title" />
                  <mat-error>
                    @if (taskTitle.hasError('required')) {
                      Title is required
                    } @else if (taskTitle.hasError('minlength')) {
                      At least 3 characters
                    } @else if (taskTitle.hasError('forbiddenName')) {
                      This name is not allowed
                    }
                  </mat-error>
                </mat-form-field>
                <mat-form-field>
                  <mat-label>Priority</mat-label>
                  <mat-select formControlName="priority">
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
  // private readonly fb = inject(FormBuilder);
  private readonly fb = inject(NonNullableFormBuilder); // Change Type/setting/invariant on all elements!

  readonly deal = input<Deal>();
  readonly tasks = input<readonly DealTask[]>([]);

  readonly saved = output<DealEditorValue>();
  readonly cancelled = output<void>();

  protected readonly form = this.fb.group({
    // title: new FormControl('', { nonNullable: true }), 
    title: ['', dealTitleValidators],
    summary: [''],
    stage: ['new' as DealStage],
    amount: [0, [Validators.required, Validators.min(0)]],
    isPublic: [false],
    tasks: this.fb.array<FormGroup<TaskControls>>([]),
  });
  protected readonly title = this.form.controls.title;
  protected readonly amount = this.form.controls.amount;
  protected readonly taskRows = this.form.controls.tasks;

  protected readonly stages = Object.keys(DEAL_STAGE_LABELS) as DealStage[];
  protected readonly stageLabels = DEAL_STAGE_LABELS;
  protected readonly priorities = Object.keys(TASK_PRIORITY_LABELS) as TaskPriority[];
  protected readonly priorityLabels = TASK_PRIORITY_LABELS;

  constructor() {
    effect(() => {
      const deal = this.deal();
      const tasks = this.tasks();
      untracked(() => this.load(deal, tasks));
    });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saved.emit(this.form.getRawValue());
  }

  protected addTask(): void {
    this.taskRows.push(this.createTaskRow());
    this.taskRows.markAsDirty();
  }

  protected removeTask(index: number): void {
    this.taskRows.removeAt(index);
    this.taskRows.markAsDirty();
  }

  hasUnsavedChanges(): boolean {
    return this.form.dirty;
  }

  private load(deal: Deal | undefined, tasks: readonly DealTask[]): void {
    this.form.reset({
      title: deal?.title ?? '',
      summary: deal?.summary ?? '',
      stage: deal?.stage ?? 'new',
      amount: deal?.value.amount ?? 0,
      isPublic: deal?.isPublic ?? false,
    });
    this.taskRows.clear();
    for (const task of tasks) this.taskRows.push(this.createTaskRow(task));
  }

  private createTaskRow(task?: DealTask): FormGroup<TaskControls> {
    const priority: TaskPriority = task?.priority ?? 'medium';
    return this.fb.group({
      title: [task?.title ?? '', nameValidators],
      priority: [priority, Validators.required],
    });
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
