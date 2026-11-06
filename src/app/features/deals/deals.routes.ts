import { Routes } from '@angular/router';
import { unsavedChangesGuard } from '@shared';

/**
 * Route tree of the deals feature.
 * - **What:** a layout route (master list + `<router-outlet>`) with children: placeholder, `new`, `:dealId` (details with nested tasks) and `:dealId/edit`.
 * - **Why:** the URL is the single source of truth for selection and edit mode, the list stays mounted while the detail changes, and `canDeactivate` guards sit on the form routes. Stores are root-scoped, so nothing is provided here.
 */
const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/deals-layout/deals-layout.page').then((m) => m.DealsLayoutPage),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/deal-placeholder/deal-placeholder.page').then(
            (m) => m.DealPlaceholderPage,
          ),
      },
      {
        path: 'new',
        canDeactivate: [unsavedChangesGuard],
        loadComponent: () =>
          import('./pages/deal-create/deal-create.page').then((m) => m.DealCreatePage),
      },
      {
        path: ':dealId',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./pages/deal-details/deal-details.page').then((m) => m.DealDetailsPage),
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./pages/deal-tasks/deal-tasks.page').then((m) => m.DealTasksPage),
              },
            ],
          },
          {
            path: 'edit',
            canDeactivate: [unsavedChangesGuard],
            loadComponent: () =>
              import('./pages/deal-edit/deal-edit.page').then((m) => m.DealEditPage),
          },
        ],
      },
    ],
  },
];

export default routes;
