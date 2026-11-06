import { Page } from '@playwright/test';
import { expect, recordRequests, test, uniqueTitle } from './fixtures';

const dealOption = (page: Page, title: string) =>
  page.getByRole('option').filter({ hasText: title });
const nav = (page: Page) => page.getByRole('navigation', { name: 'Main' });

test.describe('caching (TTL 60 s, stale-while-revalidate)', () => {
  test('C-01 returning within the TTL makes no new requests', async ({ page, api }) => {
    const deal = await api.createDeal({ title: uniqueTitle('fresh'), contactId: 'c1' });
    await api.createTask(deal.id, 'Cached task');
    const lists = recordRequests(page, 'GET', /\/api\/deals$/);
    const details = recordRequests(page, 'GET', new RegExp(`/api/deals/${deal.id}$`));
    const tasks = recordRequests(page, 'GET', new RegExp(`/api/deals/${deal.id}/tasks$`));
    // A request that is still running is not cached yet, so wait until the list has arrived
    const listArrived = page.waitForResponse(
      (response) => response.request().method() === 'GET' && /\/api\/deals$/.test(response.url()),
    );

    await page.goto(`/deals/${deal.id}`);
    await listArrived;
    await expect(page.locator('app-deal-tasks-card mat-list-item')).toHaveCount(1);
    await expect(page.locator('app-deal-details-card')).toContainText('Anna Kowalska');
    await page.waitForTimeout(300);

    await nav(page).getByRole('link', { name: 'Contacts' }).click();
    await expect(page).toHaveURL(/\/contacts/);
    await nav(page).getByRole('link', { name: 'Deals' }).click();
    await dealOption(page, deal.title).click();
    await expect(page).toHaveURL(new RegExp(`/deals/${deal.id}$`));
    await expect(page.locator('app-deal-tasks-card mat-list-item')).toHaveCount(1);

    expect(lists).toHaveLength(1);
    expect(details).toHaveLength(1);
    expect(tasks).toHaveLength(1);
  });

  test('C-02 stale data is shown at once and refreshed quietly', async ({ page }) => {
    const lists = recordRequests(page, 'GET', /\/api\/deals$/);
    await page.clock.install();

    await page.goto('/deals');
    await expect(page.getByRole('option').first()).toBeVisible();
    await nav(page).getByRole('link', { name: 'Contacts' }).click();
    await expect(page).toHaveURL(/\/contacts/);

    await page.clock.fastForward(61_000);
    await nav(page).getByRole('link', { name: 'Deals' }).click();

    await expect(page.getByRole('option').first()).toBeVisible();
    await expect(page.getByText('Loading ...')).toHaveCount(0);
    await expect.poll(() => lists.length).toBe(2);
  });

  test('C-03 one contact request per deal page load', async ({ page, api }) => {
    const deal = await api.createDeal({
      title: uniqueTitle('one contact request'),
      contactId: 'c1',
    });
    const contacts = recordRequests(page, 'GET', /\/api\/contacts\/c1$/);

    await page.goto(`/deals/${deal.id}`);
    await expect(page.locator('app-deal-details-card')).toContainText('Anna Kowalska');
    await page.waitForTimeout(1000);

    expect(contacts).toHaveLength(1);
  });
});
