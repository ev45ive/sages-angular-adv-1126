import { Directive, inject, TemplateRef } from '@angular/core';
import { Deal } from '../../model/deal.model';

export interface DealItemContext {
  $implicit: Deal;
  selected: boolean;
}

@Directive({
  selector: '[appDealItemTpl]',
})
export class DealItemTpl {
  readonly templateRef = inject<TemplateRef<DealItemContext>>(TemplateRef);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- predicate is read by Angular's template type-checker
  static ngTemplateContextGuard(_dir: DealItemTpl, _ctx: unknown): _ctx is DealItemContext {
    return true;
  }
}
