import { APIRequestContext, expect, Page, test as base } from '@playwright/test';

const API_URL = 'http://localhost:3000/api/';

export interface ApiDeal {
  id: string;
  title: string;
  contactId: string;
}

export interface NewDeal {
  title: string;
  contactId: string;
  value?: number;
}

/**
 * Test-data client for the mock API.
 * - **What:** creates deals and tasks directly over HTTP, bypassing the UI.
 * - **Why:** the API has no reset endpoint, so every test builds its own uniquely named data and never depends on or changes the seed.
 */
export class Api {
  private readonly context: APIRequestContext;

  constructor(context: APIRequestContext) {
    this.context = context;
  }

  async createDeal(deal: NewDeal): Promise<ApiDeal> {
    const response = await this.context.post('deals', { data: deal });
    expect(response.status()).toBe(201);
    return (await response.json()) as ApiDeal;
  }

  async createTask(dealId: string, title: string, completed = false): Promise<void> {
    const created = await this.context.post(`deals/${dealId}/tasks`, { data: { title } });
    expect(created.status()).toBe(201);
    if (!completed) return;

    const { id } = (await created.json()) as { id: string };
    const updated = await this.context.patch(`deals/${dealId}/tasks/${id}`, {
      data: { completed: true },
    });
    expect(updated.ok()).toBeTruthy();
  }
}

export const test = base.extend<{ api: Api }>({
  api: async ({ playwright }, use) => {
    const context = await playwright.request.newContext({
      baseURL: API_URL,
      extraHTTPHeaders: { Authorization: 'Bearer mock-access-u1' },
    });
    await use(new Api(context));
    await context.dispose();
  },
});

export { expect };

/** Unique, readable title so a test finds its own deal among the shared data. */
export function uniqueTitle(label: string): string {
  return `E2E ${label} ${Date.now().toString(36)}${Math.floor(Math.random() * 1e4)}`;
}

/**
 * Collects the URLs of matching requests made from now on.
 * - **Why:** "exactly one POST/PUT/GET" is the observable contract of debounce and caching.
 */
export function recordRequests(page: Page, method: string, url: RegExp): string[] {
  const seen: string[] = [];
  page.on('request', (request) => {
    if (request.method() === method && url.test(request.url())) seen.push(request.url());
  });
  return seen;
}
