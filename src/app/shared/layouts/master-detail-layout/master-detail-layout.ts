import { Component } from '@angular/core';

@Component({
  selector: 'app-master-detail-layout',
  host: {
    class:
      'grid min-h-screen  grid-cols-1 gap-5 md:grid-cols-[minmax(200px,1fr)_3fr] md:items-start',
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
