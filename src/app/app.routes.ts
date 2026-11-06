import { Routes } from '@angular/router';
import { provideContactDirectory } from './contact-directory.provider';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/deals',
    pathMatch: 'full',
  },
  {
    path: 'deals',
    // eager loading
    // component : DealsPage,

    // lazy loading; the token comes from the lazy module, so the deals feature stays out of the main bundle
    loadChildren: () =>
      import('./features/deals').then((m) => [
        {
          path: '',
          providers: [provideContactDirectory(m.CONTACT_DIRECTORY)],
          children: m.dealsRoutes,
        },
      ]),
  },
  {
    path: 'contacts',
    loadChildren: () => import('@feature/contacts').then((m) => m.contactsRoutes),
  },
  {
    path: '**',
    loadComponent: () => import('./core').then((m) => m.PageNotFound),
  },
];
