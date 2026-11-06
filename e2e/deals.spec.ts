import { Page } from '@playwright/test';
import { expect, recordRequests, test, uniqueTitle } from './fixtures';

const dealOption = (page: Page, title: string) =>
  page.getByRole('option').filter({ hasText: title });
const taskItems = (page: Page) => page.locator('app-deal-tasks-card mat-list-item');
const detailsCard = (page: Page) => page.locator('app-deal-details-card');
const titleBox = (page: Page) => page.getByRole('textbox', { name: 'Title', exact: true });
const saveButton = (page: Page) => page.getByRole('button', { name: 'Save', exact: true });
const layoutAlerts = (page: Page) => page.getByRole('main').getByRole('alert');

test.describe('deals: routing and list', () => {
  test('D-01 deep link keeps the URL and highlights the deal', async ({ page, api }) => {
    const deal = await api.createDeal({ title: uniqueTitle('deep link'), contactId: 'c3' });

    await page.goto(`/deals/${deal.id}`);

    await expect(detailsCard(page)).toContainText(deal.title);
    await expect(page.getByRole('option', { selected: true })).toContainText(deal.title);
    await expect(page).toHaveURL(new RegExp(`/deals/${deal.id}$`));
  });

  test('D-02 deep link to new stays on the form with nothing highlighted', async ({ page }) => {
    await page.goto('/deals/new');

    await expect(page.getByRole('option').first()).toBeVisible();
    await expect(page.getByText('New Deal')).toBeVisible();
    await expect(page.getByRole('option', { selected: true })).toHaveCount(0);
    await expect(page).toHaveURL(/\/deals\/new$/);
  });

  test('D-03 selecting from the list opens the deal', async ({ page, api }) => {
    const deal = await api.createDeal({ title: uniqueTitle('select'), contactId: 'c1' });

    await page.goto('/deals');
    await expect(page.getByText('Select a deal')).toBeVisible();
    await dealOption(page, deal.title).click();

    await expect(page).toHaveURL(new RegExp(`/deals/${deal.id}$`));
    await expect(detailsCard(page)).toContainText(deal.title);
    await expect(dealOption(page, deal.title)).toHaveAttribute('aria-selected', 'true');
  });

  test('D-04 filter is kept in the URL and narrows the list', async ({ page, api }) => {
    const deal = await api.createDeal({ title: uniqueTitle('filter'), contactId: 'c2' });

    await page.goto('/deals');
    await page.getByRole('searchbox', { name: 'Filter deals' }).fill(deal.title);

    await expect(page).toHaveURL(/dealFilter=/);
    await expect(page.getByRole('option')).toHaveCount(1);
    await expect(page.getByRole('option')).toContainText(deal.title);
  });

  test('D-05 unknown deal shows a single error', async ({ page }) => {
    await page.goto('/deals/does-not-exist');

    await expect(layoutAlerts(page)).toHaveCount(1);
    await expect(layoutAlerts(page)).toHaveText('Deal not found');
    await expect(detailsCard(page)).toHaveCount(0);
  });
});

test.describe('deals: tasks', () => {
  test('D-06 open tasks are listed before completed ones', async ({ page, api }) => {
    const deal = await api.createDeal({ title: uniqueTitle('task order'), contactId: 'c1' });
    await api.createTask(deal.id, 'Alpha task', true);
    await api.createTask(deal.id, 'Beta task');

    await page.goto(`/deals/${deal.id}`);

    await expect(taskItems(page)).toHaveText([/Beta task/, /Alpha task/]);
  });

  test('D-07 toggling a task updates at once and sends one PATCH', async ({ page, api }) => {
    const deal = await api.createDeal({ title: uniqueTitle('toggle'), contactId: 'c1' });
    await api.createTask(deal.id, 'Alpha task');
    await api.createTask(deal.id, 'Beta task');
    const patches = recordRequests(page, 'PATCH', /\/tasks\//);
    await page.route('**/api/deals/*/tasks/*', async (route) => {
      if (route.request().method() === 'PATCH') {
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
      await route.continue();
    });

    await page.goto(`/deals/${deal.id}`);
    await expect(taskItems(page)).toHaveText([/Alpha task/, /Beta task/]);
    const alpha = taskItems(page).filter({ hasText: 'Alpha task' });
    await alpha.getByRole('checkbox').click();

    // The PATCH is held back for 1.5 s, so this passes only with an optimistic update
    await expect(taskItems(page)).toHaveText([/Beta task/, /Alpha task/], { timeout: 1000 });
    await expect(alpha.getByRole('checkbox')).toBeChecked();
    await expect.poll(() => patches.length).toBe(1);
    await expect(taskItems(page)).toHaveText([/Beta task/, /Alpha task/]);
  });

  test('D-08 a new task is listed first and the composer is cleared', async ({ page, api }) => {
    const deal = await api.createDeal({ title: uniqueTitle('add task'), contactId: 'c1' });
    await api.createTask(deal.id, 'Existing task');
    const title = uniqueTitle('task');

    await page.goto(`/deals/${deal.id}`);
    const composer = page.getByRole('textbox', { name: 'New task' });
    await composer.fill(title);
    await page.getByRole('button', { name: 'Add', exact: true }).click();

    await expect(taskItems(page).first()).toContainText(title);
    await expect(taskItems(page)).toHaveCount(2);
    await expect(composer).toHaveValue('');
  });
});

test.describe('deals: create and edit', () => {
  test('E-01 an empty form is rejected without a request', async ({ page }) => {
    const posts = recordRequests(page, 'POST', /\/api\/deals$/);

    await page.goto('/deals/new');
    await saveButton(page).click();

    await expect(page.getByText('Title is required')).toBeVisible();
    await expect(page.getByText('Contact is required')).toBeVisible();
    await page.waitForTimeout(600);
    expect(posts).toHaveLength(0);
  });

  test('E-02 the contact picker offers contacts and narrows while typing', async ({ page }) => {
    await page.goto('/deals/new');
    const contact = page.getByRole('combobox', { name: 'Contact' });

    await contact.click();
    await expect(page.locator('mat-option', { hasText: 'Marek Nowak' })).toBeVisible();
    await expect(page.locator('mat-option', { hasText: 'Anna Kowalska' })).toBeVisible();

    await contact.fill('mar');
    await expect(page.locator('mat-option')).toHaveCount(1);
    await expect(page.locator('mat-option')).toContainText('Marek Nowak');
  });

  test('E-03 creating with a double click sends one POST', async ({ page }) => {
    const title = uniqueTitle('created');
    const posts = recordRequests(page, 'POST', /\/api\/deals$/);

    await page.goto('/deals/new');
    await titleBox(page).fill(title);
    await page.getByRole('spinbutton', { name: 'Value ($)' }).fill('777');
    await page.getByRole('combobox', { name: 'Contact' }).click();
    await page.locator('mat-option', { hasText: 'Ewa Wiśniewska' }).click();
    await saveButton(page).dblclick();

    await expect(page).toHaveURL(/\/deals\/[0-9a-f-]{36}$/);
    await expect(detailsCard(page)).toContainText(title);
    await expect(detailsCard(page)).toContainText('Ewa Wiśniewska');
    await expect(dealOption(page, title)).toBeVisible();
    expect(posts).toHaveLength(1);
  });

  test('E-04 a deal created for a contact is listed on that contact', async ({ page, api }) => {
    const deal = await api.createDeal({ title: uniqueTitle('related'), contactId: 'c3' });

    await page.goto('/contacts/c3');

    await expect(page.getByRole('heading', { name: 'Ewa Wiśniewska' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Related deals' })).toContainText(deal.title);
  });

  test('E-05 the edit form is prefilled, including the contact name', async ({ page, api }) => {
    const deal = await api.createDeal({
      title: uniqueTitle('prefill'),
      contactId: 'c1',
      value: 500,
    });

    await page.goto(`/deals/${deal.id}/edit`);

    await expect(titleBox(page)).toHaveValue(deal.title);
    await expect(page.getByRole('spinbutton', { name: 'Value ($)' })).toHaveValue('500');
    await expect(page.getByRole('combobox', { name: 'Contact' })).toHaveValue('Anna Kowalska');
  });

  test('E-06 saving with a double click sends one PUT and shows the change everywhere', async ({
    page,
    api,
  }) => {
    const deal = await api.createDeal({ title: uniqueTitle('rename'), contactId: 'c1' });
    const renamed = uniqueTitle('renamed');
    const puts = recordRequests(page, 'PUT', new RegExp(`/api/deals/${deal.id}$`));

    await page.goto(`/deals/${deal.id}/edit`);
    await expect(titleBox(page)).toHaveValue(deal.title);
    await titleBox(page).fill(renamed);
    await saveButton(page).dblclick();

    await expect(page).toHaveURL(new RegExp(`/deals/${deal.id}$`));
    await expect(detailsCard(page)).toContainText(renamed);
    await expect(dealOption(page, renamed)).toBeVisible();
    expect(puts).toHaveLength(1);

    const nav = page.getByRole('navigation', { name: 'Main' });
    await nav.getByRole('link', { name: 'Contacts' }).click();
    await page.locator('app-contact-card', { hasText: 'Anna Kowalska' }).click();
    await expect(page.getByRole('region', { name: 'Related deals' })).toContainText(renamed);
  });

  test('E-07 dismissing the unsaved-changes prompt keeps the edit page', async ({ page, api }) => {
    const deal = await api.createDeal({ title: uniqueTitle('guard dismiss'), contactId: 'c1' });
    const changed = `${deal.title} changed`;
    let message = '';

    await page.goto(`/deals/${deal.id}/edit`);
    await expect(titleBox(page)).toHaveValue(deal.title);
    await titleBox(page).fill(changed);
    page.once('dialog', (dialog) => {
      message = dialog.message();
      void dialog.dismiss();
    });
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();

    await expect.poll(() => message).toBe('Discard unsaved changes?');
    await expect(page).toHaveURL(new RegExp(`/deals/${deal.id}/edit$`));
    await expect(titleBox(page)).toHaveValue(changed);
  });

  test('E-08 accepting the unsaved-changes prompt discards the edit', async ({ page, api }) => {
    const deal = await api.createDeal({ title: uniqueTitle('guard accept'), contactId: 'c1' });

    await page.goto(`/deals/${deal.id}/edit`);
    await expect(titleBox(page)).toHaveValue(deal.title);
    await titleBox(page).fill(`${deal.title} changed`);
    page.once('dialog', (dialog) => void dialog.accept());
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();

    await expect(page).toHaveURL(new RegExp(`/deals/${deal.id}$`));
    await expect(detailsCard(page)).toContainText(deal.title);
    await expect(detailsCard(page)).not.toContainText('changed');
  });

  test('E-09 a failed save rolls back and reports the error', async ({ page, api }) => {
    const deal = await api.createDeal({ title: uniqueTitle('rollback'), contactId: 'c1' });
    const changed = `${deal.title} changed`;
    await page.route(`**/api/deals/${deal.id}`, (route) =>
      route.request().method() === 'PUT'
        ? route.fulfill({
            status: 404,
            contentType: 'application/json',
            body: JSON.stringify({
              error: { status: 404, message: 'Forced failure', code: 'NOT_FOUND' },
            }),
          })
        : route.fallback(),
    );

    await page.goto(`/deals/${deal.id}/edit`);
    await expect(titleBox(page)).toHaveValue(deal.title);
    await titleBox(page).fill(changed);
    await saveButton(page).click();

    await expect(layoutAlerts(page).first()).toHaveText('Forced failure');
    await expect(titleBox(page)).toHaveValue(deal.title);
    await expect(dealOption(page, deal.title)).toBeVisible();
    await expect(dealOption(page, changed)).toHaveCount(0);
    await expect(saveButton(page)).toBeEnabled();
    await expect(page).toHaveURL(new RegExp(`/deals/${deal.id}/edit$`));
  });

  test('E-11 a late tasks response does not wipe what was typed', async ({ page, api }) => {
    const deal = await api.createDeal({ title: uniqueTitle('late response'), contactId: 'c1' });
    const changed = `${deal.title} changed`;
    const tasksUrl = new RegExp(`/api/deals/${deal.id}/tasks$`);
    await page.route(tasksUrl, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.continue();
    });
    const tasksArrived = page.waitForResponse((response) => tasksUrl.test(response.url()));

    await page.goto(`/deals/${deal.id}/edit`);
    await expect(titleBox(page)).toHaveValue(deal.title);
    await titleBox(page).fill(changed);
    await tasksArrived;

    await expect(titleBox(page)).toHaveValue(changed);
    page.once('dialog', (dialog) => void dialog.dismiss());
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/deals/${deal.id}/edit$`));
  });
});
