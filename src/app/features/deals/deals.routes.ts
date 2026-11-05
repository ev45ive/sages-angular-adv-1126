import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/deals-list/deals-list.page').then((m) => m.DealsPage),
  },
];

export default routes;
