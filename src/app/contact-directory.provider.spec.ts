import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CONTACT_DIRECTORY } from '@feature/deals';
import { provideContactDirectory } from './contact-directory.provider';

describe('lazy contact directory', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideContactDirectory(CONTACT_DIRECTORY),
      ],
    });
  });

  it('is empty and loading until the contacts chunk has loaded', () => {
    const directory = TestBed.inject(CONTACT_DIRECTORY);

    expect(directory.loading()).toBe(true);
    expect(directory.optionsById()).toEqual({});
    expect(directory.searchResults()).toEqual({});
  });

  it('runs commands issued before the chunk loaded, in order, and exposes the results', async () => {
    const http = TestBed.inject(HttpTestingController);
    const directory = TestBed.inject(CONTACT_DIRECTORY);

    directory.search('ann');
    directory.search('mar');

    const first = await vi.waitFor(() =>
      http.expectOne((r) => r.url === 'contacts' && r.params.get('q') === 'ann'),
    );
    const second = http.expectOne((r) => r.url === 'contacts' && r.params.get('q') === 'mar');

    first.flush({
      contacts: {
        items: [
          {
            id: 'c1',
            firstName: 'Anna',
            lastName: 'Kowalska',
            email: 'anna@example.com',
            status: 'customer',
            createdAt: '2025-06-15T10:30:00Z',
            company: 'Tech Solutions',
          },
        ],
        total: 1,
        offset: 0,
        limit: 20,
      },
    });
    second.flush({ contacts: { items: [], total: 0, offset: 0, limit: 20 } });

    expect(directory.loading()).toBe(false);
    expect(directory.searchResults()['ann']).toEqual([
      { id: 'c1', label: 'Anna Kowalska', description: 'Tech Solutions' },
    ]);
    expect(directory.searchResults()['mar']).toEqual([]);
    expect(directory.optionsById()['c1']?.label).toBe('Anna Kowalska');
  });
});
