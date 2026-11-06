import type {
  Contact,
  Deal,
  DealRecord,
  DealUpdateRequest,
  PagingObject,
  Task,
  TaskCreateRequest,
  TaskUpdateRequest,
} from './types.js';
import { mockContacts } from './data/mock-contacts.js';
import { mockDeals } from './data/mock-deals.js';

// ─── Helpers ──────────────────────────────────────────

function clone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

function stripTasks(record: DealRecord): Deal {
  const { tasks, ...deal } = record;
  return deal;
}

// ─── Store ────────────────────────────────────────────

class Store {
  private contacts: Contact[] = clone(mockContacts);
  private deals: DealRecord[] = clone(mockDeals);

  // ── Contacts ──────────────────────────────────────

  searchContacts(q?: string, offset = 0, limit = 20): PagingObject<Contact> {
    let filtered = this.contacts;

    if (q) {
      const lower = q.toLowerCase();
      filtered = this.contacts.filter(
        (c) =>
          c.firstName.toLowerCase().includes(lower) ||
          c.lastName.toLowerCase().includes(lower) ||
          c.email.toLowerCase().includes(lower) ||
          c.company.toLowerCase().includes(lower),
      );
    }

    return {
      items: clone(filtered.slice(offset, offset + limit)),
      total: filtered.length,
      offset,
      limit,
    };
  }

  getContact(id: string): Contact | undefined {
    const contact = this.contacts.find((c) => c.id === id);
    return contact ? clone(contact) : undefined;
  }

  checkEmail(email: string): boolean {
    return this.contacts.some((c) => c.email.toLowerCase() === email.toLowerCase());
  }

  // ── Deals (responses never include tasks) ─────────

  getDeals(): PagingObject<Deal> {
    const items = this.deals.map(stripTasks);
    return {
      items: clone(items),
      total: items.length,
      offset: 0,
      limit: items.length,
    };
  }

  getDeal(id: string): Deal | undefined {
    const deal = this.deals.find((d) => d.id === id);
    return deal ? clone(stripTasks(deal)) : undefined;
  }

  updateDeal(id: string, data: DealUpdateRequest): Deal | undefined {
    const deal = this.deals.find((d) => d.id === id);
    if (!deal) return undefined;
    Object.assign(deal, data);
    return clone(stripTasks(deal));
  }

  // ── Tasks ─────────────────────────────────────────

  getTasks(dealId: string): Task[] | undefined {
    const deal = this.deals.find((d) => d.id === dealId);
    return deal ? clone(deal.tasks) : undefined;
  }

  addTask(dealId: string, data: TaskCreateRequest): Task | undefined {
    const deal = this.deals.find((d) => d.id === dealId);
    if (!deal) return undefined;

    const task: Task = {
      id: crypto.randomUUID(),
      title: data.title,
      dueDate: data.dueDate ?? '',
      priority: data.priority ?? 'medium',
      completed: false,
    };
    deal.tasks.push(task);
    return clone(task);
  }

  updateTask(dealId: string, taskId: string, data: TaskUpdateRequest): Task | undefined {
    const deal = this.deals.find((d) => d.id === dealId);
    if (!deal) return undefined;

    const task = deal.tasks.find((t) => t.id === taskId);
    if (!task) return undefined;

    Object.assign(task, data);
    return clone(task);
  }

  deleteTask(dealId: string, taskId: string): boolean {
    const deal = this.deals.find((d) => d.id === dealId);
    if (!deal) return false;

    const idx = deal.tasks.findIndex((t) => t.id === taskId);
    if (idx === -1) return false;

    deal.tasks.splice(idx, 1);
    return true;
  }
}

export const store = new Store();
