import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'deals',
    // eager loading
    // component : DealsPage, 
    
    // lazy loading:
    loadComponent: () => import('./deals-page/deals-page').then((m) => m.DealsPage),
  },
];
