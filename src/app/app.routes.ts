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
    path: '**',
    loadComponent: () =>
      import('./core/pages/page-not-found/page-not-found').then((m) => m.PageNotFound),
  },
];
