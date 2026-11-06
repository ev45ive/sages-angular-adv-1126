import { ActivatedRouteSnapshot, Routes } from '@angular/router';
import { ContactsStore } from './data/contacts.store';

// One ContactsStore for the whole feature, shared by the search and details pages.
const routes: Routes = [
  {
    path: '',
    providers: [ContactsStore],
    children: [
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
        resolve:{
            contact:(route: ActivatedRouteSnapshot) => {
                
            }
        },
        loadComponent: () =>
          import('./pages/contact-details/contact-details.page').then((m) => m.ContactDetailsPage),
      },
    ],
  },
];

export default routes;
