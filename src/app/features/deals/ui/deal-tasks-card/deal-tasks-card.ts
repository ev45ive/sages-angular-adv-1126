import { Component, input, output } from '@angular/core';
import { SharedImports } from '@shared';
import { DealTask, TaskPriority } from '../../model/deal-task.model';
import { DealTaskComposer } from '../deal-task-composer/deal-task-composer';
import { TaskPriorityBadge } from '../task-priority-badge/task-priority-badge';

@Component({
  selector: 'app-deal-tasks-card',
  imports: [SharedImports, DealTaskComposer, TaskPriorityBadge],
  styles: `
    :host {
      display: block;
    }
  `,
  template: `
    <mat-card appearance="outlined">
      <mat-card-header>
        <mat-card-title>Tasks</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <app-deal-task-composer (submitted)="taskAdded.emit($event)" />

        <mat-list class="mt-4">
          @for (task of tasks(); track task.id) {
            <mat-list-item>
              <mat-checkbox
                matListItemIcon
                [checked]="task.done"
                (change)="taskToggled.emit(task.id)"
                [attr.aria-label]="'Mark ' + task.title + (task.done ? ' as not done' : ' as done')"
              />
              <span matListItemTitle [class.line-through]="task.done">{{ task.title }}</span>
              @if (task.dueDate) {
                <span matListItemLine>Due: {{ task.dueDate }}</span>
              }
              <app-task-priority-badge matListItemMeta [priority]="task.priority" />
            </mat-list-item>
          } @empty {
            <mat-list-item>
              <span matListItemTitle>No tasks yet</span>
            </mat-list-item>
          }
        </mat-list>
      </mat-card-content>
      <mat-card-actions align="end">
        <button matButton="text" type="button" (click)="archiveCompletedRequested.emit()">
          Archive completed
        </button>
      </mat-card-actions>
    </mat-card>
  `,
})
export class DealTasksCard {
  readonly tasks = input.required<readonly DealTask[]>();
  readonly taskAdded = output<{ title: string; priority: TaskPriority }>();
  readonly taskToggled = output<string>();
  readonly archiveCompletedRequested = output<void>();
}
