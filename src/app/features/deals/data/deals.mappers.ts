import { Deal, DealChanges, DealDraft, DealStage } from '../model/deal.model';
import { DealTask, TaskChanges, TaskDraft, TaskPriority } from '../model/deal-task.model';

// Mirrors server/openapi.yaml. Features cannot import core/model, so the shapes are kept here.

export interface DealDto {
  id: string;
  title: string;
  value: number;
  stage: DealStage;
  description: string;
  contactId: string;
  public: boolean;
  createdAt: string;
}

export interface PagedDto<T> {
  items: T[];
  total: number;
  offset: number;
  limit: number;
}

export interface DealCreateRequestDto {
  title: string;
  contactId: string;
  value: number;
  stage: DealStage;
  description: string;
  public: boolean;
}

export type DealUpdateRequestDto = Partial<DealCreateRequestDto>;

export interface TaskDto {
  id: string;
  title: string;
  dueDate?: string;
  priority: TaskPriority;
  completed: boolean;
}

export interface TaskCreateRequestDto {
  title: string;
  dueDate?: string;
  priority?: TaskPriority;
}

export type TaskUpdateRequestDto = Partial<TaskCreateRequestDto> & { completed?: boolean };

export function toDeal(dto: DealDto): Deal {
  return {
    id: dto.id,
    title: dto.title,
    summary: dto.description,
    stage: dto.stage,
    value: { amount: dto.value, currency: 'USD' },
    contactId: dto.contactId,
    isPublic: dto.public,
  };
}

export function toDealCreateRequest(draft: DealDraft): DealCreateRequestDto {
  return {
    title: draft.title,
    contactId: draft.contactId,
    value: draft.value.amount,
    stage: draft.stage,
    description: draft.summary,
    public: draft.isPublic,
  };
}

// Only the fields present in `changes` are sent
export function toDealUpdateRequest(changes: DealChanges): DealUpdateRequestDto {
  return {
    ...(changes.title !== undefined && { title: changes.title }),
    ...(changes.contactId !== undefined && { contactId: changes.contactId }),
    ...(changes.value !== undefined && { value: changes.value.amount }),
    ...(changes.stage !== undefined && { stage: changes.stage }),
    ...(changes.summary !== undefined && { description: changes.summary }),
    ...(changes.isPublic !== undefined && { public: changes.isPublic }),
  };
}

// The server does not repeat the deal id on a task
export function toTask(dealId: string, dto: TaskDto): DealTask {
  return {
    id: dto.id,
    dealId,
    title: dto.title,
    // The server stores a missing due date as ''
    dueDate: dto.dueDate || undefined,
    priority: dto.priority,
    done: dto.completed,
  };
}

export function toTaskCreateRequest(draft: TaskDraft): TaskCreateRequestDto {
  return {
    title: draft.title,
    priority: draft.priority,
    ...(draft.dueDate !== undefined && { dueDate: draft.dueDate }),
  };
}

export function toTaskUpdateRequest(changes: TaskChanges): TaskUpdateRequestDto {
  return {
    ...(changes.title !== undefined && { title: changes.title }),
    ...(changes.dueDate !== undefined && { dueDate: changes.dueDate }),
    ...(changes.priority !== undefined && { priority: changes.priority }),
    ...(changes.done !== undefined && { completed: changes.done }),
  };
}
