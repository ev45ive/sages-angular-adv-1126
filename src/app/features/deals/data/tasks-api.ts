import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map, Observable } from 'rxjs';
import { DealTask, TaskChanges, TaskDraft } from '../model/deal-task.model';
import { TaskDto, toTask, toTaskCreateRequest, toTaskUpdateRequest } from './deals.mappers';

/**
 * HTTP gateway for the tasks sub-resource of a deal (`/deals/:id/tasks`).
 * - **What:** separate from `DealsApi`: tasks have their own endpoints and their own store.
 * - **Why:** one API class per backend resource keeps stores independent and fakeable.
 */
@Service()
export class TasksApi {
  private readonly http = inject(HttpClient);

  list(dealId: string): Observable<DealTask[]> {
    return this.http
      .get<TaskDto[]>(this.url(dealId))
      .pipe(map((tasks) => tasks.map((task) => toTask(dealId, task))));
  }

  create(dealId: string, draft: TaskDraft): Observable<DealTask> {
    return this.http
      .post<TaskDto>(this.url(dealId), toTaskCreateRequest(draft))
      .pipe(map((task) => toTask(dealId, task)));
  }

  update(dealId: string, taskId: string, changes: TaskChanges): Observable<DealTask> {
    return this.http
      .patch<TaskDto>(this.url(dealId, taskId), toTaskUpdateRequest(changes))
      .pipe(map((task) => toTask(dealId, task)));
  }

  delete(dealId: string, taskId: string): Observable<void> {
    return this.http.delete<void>(this.url(dealId, taskId));
  }

  private url(dealId: string, taskId?: string): string {
    const base = `deals/${encodeURIComponent(dealId)}/tasks`;
    return taskId === undefined ? base : `${base}/${encodeURIComponent(taskId)}`;
  }
}
