import { TestBed } from '@angular/core/testing';
import { CLOCK } from '@shared';
import { of, Subject } from 'rxjs';
import { DealTask } from '../model/deal-task.model';
import { TasksApi } from './tasks-api';
import { TasksStore } from './tasks.store';

const TTL_MS = 60_000;

function makeTask(overrides: Partial<DealTask> = {}): DealTask {
  return {
    id: 't1',
    dealId: 'd1',
    title: 'Send proposal',
    priority: 'high',
    done: false,
    ...overrides,
  };
}

describe('TasksStore', () => {
  const api = { list: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() };
  let now: number;

  beforeEach(() => {
    now = 1_000_000;
    api.list.mockReset().mockReturnValue(of([makeTask(), makeTask({ id: 't2', title: 'Call' })]));
    TestBed.configureTestingModule({
      providers: [
        { provide: TasksApi, useValue: api },
        { provide: CLOCK, useValue: () => now },
      ],
    });
  });

  it('lists the open tasks of a deal first', () => {
    const store = TestBed.inject(TasksStore);
    api.list.mockReturnValue(of([makeTask({ done: true }), makeTask({ id: 't2', title: 'Call' })]));

    store.loadTasksForDeal('d1');

    expect(
      store
        .selectTasksByDealId(() => 'd1')()
        .map((task) => task.id),
    ).toEqual(['t2', 't1']);
    expect(store.selectTasksByDealId(() => 'other')()).toEqual([]);
  });

  it('applies a change at once and keeps it when the server confirms', () => {
    const response = new Subject<DealTask>();
    api.update.mockReturnValue(response);
    const store = TestBed.inject(TasksStore);
    store.loadTasksForDeal('d1');
    const tasks = store.selectTasksByDealId(() => 'd1');

    store.updateTask({ dealId: 'd1', taskId: 't1', changes: { done: true } });

    expect(tasks().map((task) => [task.id, task.done])).toEqual([
      ['t2', false],
      ['t1', true],
    ]);
    expect(store.selectLoadingById(() => 't1')()).toBe(true);

    response.next(makeTask({ done: true }));
    response.complete();

    expect(store.selectLoadingById(() => 't1')()).toBe(false);
    expect(tasks().find((task) => task.id === 't1')?.done).toBe(true);
  });

  it('reverts the change when the server rejects it', () => {
    const response = new Subject<DealTask>();
    api.update.mockReturnValue(response);
    const store = TestBed.inject(TasksStore);
    store.loadTasksForDeal('d1');

    store.updateTask({ dealId: 'd1', taskId: 't1', changes: { done: true } });
    response.error(new Error('Rejected'));

    expect(
      store
        .selectTasksByDealId(() => 'd1')()
        .find((task) => task.id === 't1')?.done,
    ).toBe(false);
    expect(store.selectError()).toBe('Rejected');
  });

  it('drops tasks that disappeared on the server when the list is refetched', () => {
    const store = TestBed.inject(TasksStore);
    store.loadTasksForDeal('d1');

    now += TTL_MS;
    api.list.mockReturnValue(of([makeTask()]));
    store.loadTasksForDeal('d1');

    expect(
      store
        .selectTasksByDealId(() => 'd1')()
        .map((task) => task.id),
    ).toEqual(['t1']);
  });

  it('removes a task after the server deleted it', () => {
    api.delete.mockReturnValue(of(undefined));
    const store = TestBed.inject(TasksStore);
    store.loadTasksForDeal('d1');

    store.deleteTask({ dealId: 'd1', taskId: 't2' });

    expect(
      store
        .selectTasksByDealId(() => 'd1')()
        .map((task) => task.id),
    ).toEqual(['t1']);
  });
});
