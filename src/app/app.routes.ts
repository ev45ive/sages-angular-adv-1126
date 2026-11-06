import { Routes } from '@angular/router';
import { provideContactDirectory } from './contact-directory.provider';

/**
 * Root route table.
 * - **What:** lazy feature entry points; the `deals` route also provides `CONTACT_DIRECTORY` for its subtree.
 * - **Why:** the root is the only layer allowed to know both features, so deals reaches contacts without importing it. The token comes from the lazy module, which keeps deals out of the main bundle.
 */
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

    // lazy loading:
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
