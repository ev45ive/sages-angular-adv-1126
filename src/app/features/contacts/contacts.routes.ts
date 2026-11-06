import { Routes } from '@angular/router';

// ContactsStore is root-scoped, so the pages share its cached entities.
const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'search?q=',
  },
  {
    path: 'search',
    loadComponent: () =>
      import('./pages/contact-search/contact-search.page').then((m) => m.ContactSearchPage),
  },
  {
    path: ':contactId',
    loadComponent: () =>
      import('./pages/contact-details/contact-details.page').then((m) => m.ContactDetailsPage),
  },
];

export default routes;
