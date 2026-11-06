import { Routes } from '@angular/router';

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
    loadChildren: () => import('./features/deals').then((m) => m.dealsRoutes),
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
