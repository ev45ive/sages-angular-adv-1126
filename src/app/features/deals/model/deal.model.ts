export type DealStage = 'new' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';

export const DEAL_STAGE_LABELS: Record<DealStage, string> = {
  new: 'New',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  'closed-won': 'Closed won',
  'closed-lost': 'Closed lost',
};

export interface Money {
  amount: number;
  currency: 'USD';
}

export interface Deal {
  id: string;
  title: string;
  summary: string;
  stage: DealStage;
  value: Money;
  contactId: string;
  isPublic: boolean;
}

// Fields the user provides when creating a deal
export type DealDraft = Omit<Deal, 'id'>;

export type DealChanges = Partial<DealDraft>;
