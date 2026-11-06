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
import { NgTemplateOutlet } from '@angular/common';
import { Listbox, Option } from '@angular/aria/listbox';
import { Deal } from '../../model/deal.model';
import { DealItemContext, DealItemTpl } from '../deal-item-tpl/deal-item-tpl';

@Component({
  selector: 'app-deal-master-list',
  imports: [Listbox, Option, NgTemplateOutlet],
  styles: ``,
  host: { class: 'grid gap-5' },
  template: `
    <div class="grid gap-2">
      <ng-content select="[app-master-list-header]"> Deals List </ng-content>
    </div>

    <div
      ngListbox
      aria-label="Deals"
      selectionMode="follow"
      class=" flex flex-col gap-1"
      [value]="[]"
      (valueChange)="onValueChange($event)"
    >
      @for (deal of deals(); track deal.id) {
        <div
          ngOption
          [value]="deal.id"
          class="min-w-0 cursor-pointer rounded-md p-3 outline-none hover:bg-surface-container-high aria-selected:bg-secondary-container aria-selected:text-on-secondary-container data-[active=true]:outline-2 data-[active=true]:outline-primary"
        >
          <ng-container
            [ngTemplateOutlet]="itemTpl().templateRef"
            [ngTemplateOutletContext]="{ $implicit: deal, selected: deal.id === selectedId() }"
          />
        </div>
      }
    </div>

    @if (deals().length === 0) {
      <ng-container *ngTemplateOutlet="emptyTpl()"></ng-container>
    }
    <ng-template #empty>
      <p class="mt-3 px-3 text-body-md text-on-surface-variant">No deals match the filter</p>
    </ng-template>

    <div class="grid gap-2">
      <ng-content select="[app-master-list-footer]"> </ng-content>
    </div>
  `,
})
export class DealMasterList {
  readonly deals = input.required<Deal[]>();

  // Parent may override #empty template (contentChild()), default to local (viewChild())
  empty = viewChild<TemplateRef<unknown>>('empty');
  emptyOverride = contentChild<TemplateRef<unknown>>('empty');
  emptyTpl = computed(() => this.emptyOverride() ?? this.empty());

  // <app-deal-master-list [itemTplInput]="templateReferece" />
  readonly itemTplInput = input<TemplateRef<DealItemContext>>();

  readonly itemTpl = contentChild.required(DealItemTpl);

  readonly selectedId = input<string | null>(null);
  readonly dealSelected = output<string | null>();

  protected readonly selectedValue = computed(() => {
    return this.selectedId() ? [this.selectedId()] : null;
  });

  protected onValueChange([id]: (string | null)[]): void {
    this.dealSelected.emit(id);
  }
}
