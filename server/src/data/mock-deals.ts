import type { DealRecord } from '../types.js';

export const mockDeals: DealRecord[] = [
  {
    id: 'd1',
    title: 'Enterprise License — Tech Solutions',
    value: 48000,
    stage: 'negotiation',
    description: 'Annual enterprise license for 50 seats. Awaiting legal review.',
    contactId: 'c1',
    public: true,
    tasks: [
      { id: 't1', title: 'Send revised proposal', dueDate: '2026-03-15', priority: 'high', completed: false },
      { id: 't2', title: 'Schedule call with legal', dueDate: '2026-03-10', priority: 'medium', completed: true },
    ],
    createdAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 'd2',
    title: 'Pilot Program — DataFlow',
    value: 12000,
    stage: 'new',
    description: '3-month pilot for data integration module.',
    contactId: 'c2',
    public: false,
    tasks: [
      { id: 't3', title: 'Prepare pilot environment', dueDate: '2026-03-20', priority: 'high', completed: false },
    ],
    createdAt: '2026-02-28T12:30:00Z',
  },
  {
    id: 'd3',
    title: 'Design Workshop — Creative Agency',
    value: 5000,
    stage: 'proposal',
    description: 'One-week UX/UI workshop with deliverables.',
    contactId: 'c3',
    public: true,
    tasks: [],
    createdAt: '2026-02-01T16:00:00Z',
  },
  {
    id: 'd4',
    title: 'Renewal — BuildRight',
    value: 24000,
    stage: 'closed-lost',
    description: 'Customer decided not to renew. Budget constraints.',
    contactId: 'c4',
    public: false,
    tasks: [
      { id: 't4', title: 'Send win-back offer', dueDate: '2026-04-01', priority: 'low', completed: false },
    ],
    createdAt: '2025-12-15T10:00:00Z',
  },
];
