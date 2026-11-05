import { Routes } from '@angular/router';
import { DealsStore } from './data/deals.store';

const routes: Routes = [
  {
    path: '',
    providers: [DealsStore], // Route Lifecycle?
    loadComponent: () => import('./pages/deals-list/deals-list.page').then((m) => m.DealsPage),
  },
];

export default routes;
