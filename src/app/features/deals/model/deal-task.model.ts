export type TaskPriority = 'low' | 'medium' | 'high';

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export interface DealTask {
  id: string;
  dealId: string;
  title: string;
  // yyyy-mm-dd; undefined means no due date
  dueDate?: string;
  priority: TaskPriority;
  done: boolean;
}
