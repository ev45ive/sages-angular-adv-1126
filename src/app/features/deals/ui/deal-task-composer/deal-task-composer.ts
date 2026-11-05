import { Component, computed, output, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { SharedImports } from '@shared';
import { TASK_PRIORITY_LABELS, TaskPriority } from '../../model/deal-task.model';

interface NewTaskDraft {
  title: string;
  priority: TaskPriority;
}

const emptyTask = (): NewTaskDraft => ({ title: '', priority: 'medium' });

@Component({
  selector: 'app-deal-task-composer',
  imports: [SharedImports, FormField],
  template: `
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
      <button matButton="filled" type="button" [disabled]="!canSubmit()" (click)="submit()">
        Add
      </button>
    </div>
  `,
})
export class DealTaskComposer {
  readonly submitted = output<{ title: string; priority: TaskPriority }>();

  protected readonly priorityLabels = TASK_PRIORITY_LABELS;
  protected readonly priorities = Object.keys(TASK_PRIORITY_LABELS) as TaskPriority[];

  private readonly draft = signal<NewTaskDraft>(emptyTask());
  protected readonly taskForm = form(this.draft);
  protected readonly canSubmit = computed(() => this.draft().title.trim() !== '');

  protected submit(): void {
    const { title, priority } = this.draft();
    if (!title.trim()) return;

    this.submitted.emit({ title: title.trim(), priority });
    this.draft.set(emptyTask());
  }
}
