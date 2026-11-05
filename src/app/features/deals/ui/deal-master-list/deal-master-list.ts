import {
  Component,
  computed,
  contentChild,
  Directive,
  inject,
  input,
  model,
  output,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { SharedImports } from '@shared';
import { Deal } from '../../model/deal.model';
import { DealListItem } from '../deal-list-item/deal-list-item';

@Directive({
  selector: '[appDealListItemTpl]',
})
export class DealListItemTpl {
  readonly tpl = inject<
    TemplateRef<{
      $implicit: Deal;
      banana: boolean;
    }>
  >(TemplateRef);

  static ngTemplateContextGuard(
    _dir: DealListItemTpl,
    ctx: unknown,
  ): ctx is { $implicit: Deal; banana: boolean } {
    return ctx !== null;
  }
}

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
            itemTpl()?.tpl;
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

  itemTpl = contentChild(DealListItemTpl);
}
