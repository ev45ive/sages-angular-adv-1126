import {
  Component,
  computed,
  contentChild,
  input,
  model,
  output,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { SharedImports } from '@shared';
import { Deal } from '../../model/deal.model';
import { DealListItem } from '../deal-list-item/deal-list-item';

@Component({
  selector: 'app-deal-master-list',
  imports: [SharedImports, DealListItem],
  styles: `
    :host {
      display: block;
    }
  `,
  template: `
    <ng-content select="[app-master-list-header]"> Deals List </ng-content>

    <mat-list class="mt-3">
      @for (deal of deals(); track deal.id) {
        <ng-container
          *ngTemplateOutlet="
            itemTpl();
            context: {
              $implicit: deal,
              banana: true,
            }
          "
        ></ng-container>
      } @empty {
        <mat-list-item>
          <span matListItemTitle>No deals match the filter</span>
        </mat-list-item>
      }
    </mat-list>

    <!-- <ng-template #listDeafultItem let-deal>
      <app-deal-list-item [deal]="deal" />
    </ng-template> -->

    <ng-content select="[app-master-list-footer]"> </ng-content>
  `,
})
export class DealMasterList {
  readonly deals = input.required<Deal[]>();

  // listDeafultItem = viewChild('listDeafultItem');
  // tpl = computed(() => this.itemTpl() ?? this.listDeafultItem());


  itemTpl = contentChild<
    TemplateRef<{
      $implicit: Deal;
      banana: boolean;
    }>
  >('listItem');
}
