import { Component, computed, contentChild, input, output } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Listbox, Option } from '@angular/aria/listbox';
import { Deal } from '../../model/deal.model';
import { DealItemTpl } from '../deal-item-tpl/deal-item-tpl';

@Component({
  selector: 'app-deal-master-list',
  imports: [Listbox, Option, NgTemplateOutlet],
  styles: `
    :host {
      display: block;
    }
  `,
  template: `
    <ng-content select="[app-master-list-header]"> Deals List </ng-content>

    <div
      ngListbox
      aria-label="Deals"
      selectionMode="follow"
      class="mt-3 flex flex-col gap-1"
      [value]="selectedValue()"
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
      <p class="mt-3 px-3 text-body-md text-on-surface-variant">No deals match the filter</p>
    }

    <ng-content select="[app-master-list-footer]"> </ng-content>
  `,
})
export class DealMasterList {
  readonly deals = input.required<Deal[]>();
  readonly itemTpl = contentChild.required(DealItemTpl);
  readonly selectedId = input<string | null>(null);
  readonly dealSelected = output<string | null>();

  protected readonly selectedValue = computed(() => {
    return [this.selectedId()];
  });

  protected onValueChange([id]: (string | null)[]): void {
    this.dealSelected.emit(id);
  }
}
