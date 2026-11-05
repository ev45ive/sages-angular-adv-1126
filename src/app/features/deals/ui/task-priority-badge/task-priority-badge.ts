import { Component, computed, input } from '@angular/core';
import { Badge } from '@shared';
import { TASK_PRIORITY_LABELS, TaskPriority } from '../../model/deal-task.model';

const PRIORITY_TONE: Record<TaskPriority, string> = {
  low: 'tone-low',
  medium: 'tone-medium',
  high: 'tone-high',
};

@Component({
  selector: 'app-task-priority-badge',
  imports: [Badge],
  styles: `
    :host {
      display: inline-block;
    }

    .tone-low {
      --badge-bg: #dcfce7;
      --badge-fg: #14532d;
    }

    .tone-medium {
      --badge-bg: #fef3c7;
      --badge-fg: #78350f;
    }

    .tone-high {
      --badge-bg: #fee2e2;
      --badge-fg: #7f1d1d;
    }
  `,
  template: ` <app-badge [class]="tone()">{{ label() }}</app-badge> `,
})
export class TaskPriorityBadge {
  readonly priority = input.required<TaskPriority>();

  protected readonly label = computed(() => TASK_PRIORITY_LABELS[this.priority()]);
  protected readonly tone = computed(() => PRIORITY_TONE[this.priority()]);
}
