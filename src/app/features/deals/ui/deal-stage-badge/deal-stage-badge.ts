import { Component, computed, input } from '@angular/core';
import { Badge } from '@shared';
import { DEAL_STAGE_LABELS, DealStage } from '../../model/deal.model';

@Component({
  selector: 'app-deal-stage-badge',
  imports: [Badge],
  styles: `
    :host {
      --badge-bg: #e5e7eb;
      --badge-fg: #374151;
    }

    :host([data-deal-stage='new']) {
      --badge-bg: #dbeafe;
      --badge-fg: #1e3a8a;
    }

    :host([data-deal-stage='proposal']) {
      --badge-bg: #ede9fe;
      --badge-fg: #5b21b6;
    }

    :host([data-deal-stage='negotiation']) {
      --badge-bg: #fef3c7;
      --badge-fg: #78350f;
    }

    :host([data-deal-stage='closed-won']) {
      --badge-bg: #dcfce7;
      --badge-fg: #14532d;
    }

    :host([data-deal-stage='closed-lost']) {
      --badge-bg: #fee2e2;
      --badge-fg: #7f1d1d;
    }
  `,
  template: ` <app-badge>{{ label() }}</app-badge> `,
  host: {
    class: 'block',
    '[attr.data-deal-stage]': 'stage()',
  },
})
export class DealStageBadge {
  readonly stage = input.required<DealStage>();

  // TODO: DealConfigurationService() .dealStageLabels()

  protected readonly label = computed(() => DEAL_STAGE_LABELS[this.stage()]);
}
