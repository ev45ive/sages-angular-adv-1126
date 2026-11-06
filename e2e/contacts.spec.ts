import { expect, test, uniqueTitle } from './fixtures';

test.describe('contacts', () => {
  test('K-01 the search form is prefilled from the URL', async ({ page }) => {
    await page.goto('/contacts/search?q=ann');

    await expect(page.getByRole('textbox', { name: 'Search contacts' })).toHaveValue('ann');
    await expect(page.locator('app-contact-card')).toHaveCount(1);
    await expect(page.locator('app-contact-card')).toContainText('Anna Kowalska');
    await expect(page.getByText('No contacts found')).toHaveCount(0);
  });

  test('K-02 an empty result is reported', async ({ page }) => {
    await page.goto('/contacts/search?q=zzz');

    await expect(page.getByText('No contacts found.')).toBeVisible();
    await expect(page.locator('app-contact-card')).toHaveCount(0);
  });

  test('K-03 contact details list the related deals', async ({ page, api }) => {
    const deal = await api.createDeal({ title: uniqueTitle('related'), contactId: 'c3' });

    await page.goto('/contacts/c3');

    await expect(page.getByRole('heading', { name: 'Ewa Wiśniewska' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Related deals' })).toContainText(deal.title);
  });

  test('K-04 an unknown contact shows an error and no details', async ({ page }) => {
    await page.goto('/contacts/does-not-exist');

    await expect(page.getByRole('main').getByRole('alert')).toHaveText('Contact not found');
    await expect(page.locator('app-contact-full-details-card')).toHaveCount(0);
    await expect(page.locator('app-contact-related-deals')).toHaveCount(0);
  });

  test('K-05 a related deal opens in the deals screen', async ({ page, api }) => {
    const deal = await api.createDeal({ title: uniqueTitle('open from contact'), contactId: 'c3' });

    await page.goto('/contacts/c3');
    await page
      .getByRole('region', { name: 'Related deals' })
      .getByRole('link', { name: deal.title })
      .click();

    await expect(page).toHaveURL(new RegExp(`/deals/${deal.id}$`));
    await expect(page.locator('app-deal-details-card')).toContainText(deal.title);
    await expect(page.getByRole('option', { selected: true })).toContainText(deal.title);
  });
});
