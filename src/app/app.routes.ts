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
    loadComponent: () => import('./deals-page/deals-page').then((m) => m.DealsPage),
  },
  {
    path: '**',
    loadComponent: () => import('./page-not-found/page-not-found').then((m) => m.PageNotFound),
  },
];
