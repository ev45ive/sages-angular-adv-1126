import { Component, computed, input } from '@angular/core';
import { Badge } from '@shared';
import { DEAL_STAGE_LABELS, DealStage } from '../../model/deal.model';

const STAGE_TONE: Record<DealStage, string> = {
  new: 'tone-new',
  proposal: 'tone-proposal',
  negotiation: 'tone-negotiation',
  'closed-won': 'tone-closed-won',
  'closed-lost': 'tone-closed-lost',
};

@Component({
  selector: 'app-deal-stage-badge',
  imports: [Badge],
  styles: `
    :host {
      display: inline-block;
    }

    .tone-new {
      --badge-bg: #dbeafe;
      --badge-fg: #1e3a8a;
    }

    .tone-proposal {
      --badge-bg: #ede9fe;
      --badge-fg: #5b21b6;
    }

    .tone-negotiation {
      --badge-bg: #fef3c7;
      --badge-fg: #78350f;
    }

    .tone-closed-won {
      --badge-bg: #dcfce7;
      --badge-fg: #14532d;
    }

    .tone-closed-lost {
      --badge-bg: #fee2e2;
      --badge-fg: #7f1d1d;
    }
  `,
  template: ` <app-badge>{{ label() }}</app-badge> `,
  host: {
    '[class]': 'tone()',
  },
})
export class DealStageBadge {
  readonly stage = input.required<DealStage>();

  // TODO: DealConfigurationService() .dealStageLabels()

  protected readonly label = computed(() => DEAL_STAGE_LABELS[this.stage()]);
  protected readonly tone = computed(() => STAGE_TONE[this.stage()]);
}
