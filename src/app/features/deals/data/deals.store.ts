import { inject, Service, signal } from '@angular/core';
import { Account } from '../model/account.model';
import { Contact } from '../model/contact.model';
import { Deal } from '../model/deal.model';
import { DealTask, TaskPriority } from '../model/deal-task.model';
import { SEED_ACCOUNTS, SEED_CONTACTS, SEED_DEALS, SEED_TASKS } from './deals-seed';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

// @Injectable({providedIn:'root'}) // default o root lifecycle if non other available

@Service()
export class DealsStore {
  // Read-Write Side - Private to Owner (my wallet!)
  private readonly dealsState = signal<Deal[]>(SEED_DEALS);

  // private readonly tasksState = signal<DealTask[]>(SEED_TASKS);
  private readonly tasksState = signal<ReadonlyArray<DealTask>>(SEED_TASKS);

  private readonly accountsState = signal<Account[]>(SEED_ACCOUNTS);
  private readonly contactsState = signal<Contact[]>(SEED_CONTACTS);

  // Read-Side: Public API
  readonly accounts = this.accountsState.asReadonly();
  readonly contacts = this.contactsState.asReadonly();

  filterDeals(text: string): Deal[] {
    const query = text.trim().toLowerCase();
    if (!query) return this.dealsState();

    return this.dealsState().filter((deal) =>
      [deal.title, this.accountName(deal.accountId), this.contactName(deal.contactId)].some(
        (value) => value.toLowerCase().includes(query),
      ),
    );
  }

  getTasksForDeal(dealId: string): DealTask[] {
    return this.tasksState().filter((task) => task.dealId === dealId);
  }

  addTask(dealId: string, title: string, priority: TaskPriority): void {
    const task: DealTask = { id: crypto.randomUUID(), dealId, title, priority, done: false };

    // Mutating Signal() State
    const tasks = this.tasksState();

    // Mutation - content changes, Container Reference is the same
    // tasks.push(task); // Compile Error - READONLYArray!

    // tasks.sort -> tasks.toSorted() // ES2025

    // Referential stability - oldRef === newRef - same object -> no changes !!!!
    // this.tasksState.set(tasks);
    // this.tasksState.update((tasks) => tasks);

    // // Same content -> new container ref -> maybe has changes
    this.tasksState.set([...tasks]);

    // Clean - no mutations - Change By COPY
    // this.tasksState.update((tasks) => [...tasks, task]);
  }

  toggleTaskDone(taskId: string): void {
    this.tasksState.update((tasks) =>
      tasks.map((task) => (task.id === taskId ? { ...task, done: !task.done } : task)),
    );
  }

  accountName(id: string): string {
    return this.accountsState().find((account) => account.id === id)?.name ?? '';
  }

  contactName(id: string): string {
    return this.contactsState().find((contact) => contact.id === id)?.fullName ?? '';
  }

  http = inject(HttpClient);

  fetchDeals(query = ''): Observable<Deal[]> {
    // Unicast Observable - lazy, 1-1 - RECIPE
    return this.http
      .get<PagingObject<Deal>>(`http://localhost:3000/api/deals`, {
        params: { query },
        headers: { Authorization: `Bearer ${'mock-access-u1'}` },
      })
      .pipe(
        //
        map((data) => data.items),
      );

    // .subscribe().unsubscribe()
  }

  fetchDealById(id = '', init?: RequestInit) {
    return this.http.get<Deal>(`http://localhost:3000/api/deals/${id}`, {
      headers: { Authorization: `Bearer ${'mock-access-u1'}` },
    });
  }
}

type PagingObject<T> = {
  items: T[];
};

export function delay(t = 500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, t));
}
