import { Component } from '@angular/core';

/**
 * Two-column master-detail layout that stacks on mobile and goes side by side from `md`.
 *
 * Rationale: one shared grid keeps the column widths and breakpoint consistent across features,
 * and consumers only supply content.
 *
 * Slots:
 * - `[appMasterDetailList]` element: left column (master list).
 * - Any other content: right column (detail).
 *
 * Snippets: `mdl` (layout), `mdl-item` (master list item).
 *
 * @example
 * ```html
 * <app-master-detail-layout>
 *   <aside appMasterDetailList>
 *     <mat-list>...</mat-list>
 *   </aside>
 *
 *   <div>...detail content...</div>
 * </app-master-detail-layout>
 * ```
 */
@Component({
  selector: 'app-master-detail-layout',
  host: {
    class:
      'grid min-h-screen grid-cols-1 gap-5 md:grid-cols-[minmax(250px,1fr)_3fr] md:items-start',
    '[class.banana]': '1 < 2',
  },
  template: `
    <aside class="min-w-0">
      <ng-content select="[appMasterDetailList]" />
    </aside>

    <div class="min-w-0">
      <ng-content />
    </div>
  `,
  styles: [],
})
export class MasterDetailLayout {}
