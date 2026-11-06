import { Component, inject, input } from '@angular/core';
import { TASKS_COMMANDS, TASKS_READER } from '../../data/deals.ports';
import { TaskPriority } from '../../model/deal-task.model';
import { DealTasksCard } from '../../ui/deal-tasks-card/deal-tasks-card';

@Component({
  imports: [DealTasksCard],
  selector: 'app-deal-tasks-page',
  template: `
    @if (error(); as message) {
      <p role="alert" class="mb-2 text-body-md text-error">{{ message }}</p>
    }
    <app-deal-tasks-card
      [tasks]="tasks()"
      (taskAdded)="onTaskAdded($event)"
      (taskToggled)="onTaskToggled($event)"
    />
  `,
})
export class DealTasksPage {
  private readonly reader = inject(TASKS_READER);
  private readonly commands = inject(TASKS_COMMANDS);

  // Inherited from the :dealId parent route (paramsInheritanceStrategy: 'always')
  readonly dealId = input.required<string>();

  protected readonly tasks = this.reader.selectTasksByDealId(this.dealId);
  protected readonly error = this.reader.selectError;

  constructor() {
    this.commands.loadTasksForDeal(this.dealId);
  }

  protected onTaskAdded(task: { title: string; priority: TaskPriority }): void {
    this.commands.createTask({ dealId: this.dealId(), draft: task });
  }

  protected onTaskToggled(taskId: string): void {
    const task = this.tasks().find((candidate) => candidate.id === taskId);
    if (!task) return;
    this.commands.updateTask({ dealId: this.dealId(), taskId, changes: { done: !task.done } });
  }
}
