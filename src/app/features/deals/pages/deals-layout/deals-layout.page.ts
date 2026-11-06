import { Component, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { MasterDetailLayout, SharedUI } from '@shared';
import { filter, map, startWith } from 'rxjs';
import { DEAL_LIST_SOURCE } from '../../data/deals.ports';
import { DealItemTpl } from '../../ui/deal-item-tpl/deal-item-tpl';
import { DealListItem } from '../../ui/deal-list-item/deal-list-item';
import { DealMasterList } from '../../ui/deal-master-list/deal-master-list';
import { DealsFilter } from '../../ui/deals-filter/deals-filter';

/**
 * Layout route component of `/deals`.
 * - **What:** a container (page) component: owns the master list and the outlet where details, edit and create render.
 * - **Why:** the only place that loads the list and maps selection/filter to URL navigation; children stay unaware of the list.
 */
@Component({
  imports: [
    ...SharedUI,
    RouterOutlet,
    MasterDetailLayout,
    DealMasterList,
    DealListItem,
    DealItemTpl,
    DealsFilter,
  ],
  selector: 'app-deals-layout-page',
  template: `
    <main class="bg-surface text-on-surface">
      <app-master-detail-layout>
        <app-deal-master-list
          appMasterDetailList
          [deals]="deals()"
          [selectedId]="selectedDealId() ?? null"
          (dealSelected)="onSelectDeal($event)"
        >
          <ng-container *appDealItemTpl="let deal; selected as isSelected">
            <app-deal-list-item [deal]="deal" />
          </ng-container>

          <app-deals-filter
            app-master-list-header
            [value]="dealFilter() ?? ''"
            (debouncedChange)="onFilterChange($event)"
          />

          <a
            app-master-list-footer
            matButton="outlined"
            routerLink="new"
            queryParamsHandling="preserve"
          >
            Create new
          </a>
        </app-deal-master-list>

        <div>
          @if (error(); as message) {
            <p role="alert" class="mb-2 text-body-md text-error">{{ message }}</p>
          }
          @if (listLoading()) {
            <p class="mb-2 text-body-md">Loading ...</p>
          }
          <router-outlet />
        </div>
      </app-master-detail-layout>
    </main>
  `,
})
export class DealsLayoutPage {
  private readonly source = inject(DEAL_LIST_SOURCE);
  private readonly router = inject(Router);

  // Bound from the ?dealFilter= query param (withComponentInputBinding)
  readonly dealFilter = input<string>();

  protected readonly deals = this.source.selectFilteredDeals(this.dealFilter);
  protected readonly listLoading = this.source.listLoading;
  protected readonly error = this.source.selectError;

  // A parent route does not receive child params, so read them from the router state
  protected readonly selectedDealId = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      startWith(null),
      map(() => this.deepestRoute().paramMap.get('dealId') ?? undefined),
    ),
  );

  constructor() {
    this.source.loadDeals();
  }

  protected onSelectDeal(dealId: string | null): void {
    if (!dealId) return;
    void this.router.navigate(['/deals', dealId], { queryParamsHandling: 'preserve' });
  }

  protected onFilterChange(text: string): void {
    void this.router.navigate([], {
      queryParams: { dealFilter: text || null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  private deepestRoute() {
    let route = this.router.routerState.snapshot.root;
    while (route.firstChild) route = route.firstChild;
    return route;
  }
}
