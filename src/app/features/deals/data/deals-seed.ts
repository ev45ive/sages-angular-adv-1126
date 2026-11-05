import { Account } from '../model/account.model';
import { Contact } from '../model/contact.model';
import { Deal } from '../model/deal.model';
import { DealTask } from '../model/deal-task.model';

export const SEED_ACCOUNTS: Account[] = [
  { id: 'acc-tech', name: 'Tech Solutions' },
  { id: 'acc-dataflow', name: 'DataFlow' },
  { id: 'acc-creative', name: 'Creative Co' },
  { id: 'acc-buildright', name: 'BuildRight' },
];

export const SEED_CONTACTS: Contact[] = [
  { id: 'con-anna', fullName: 'Anna Kowalska' },
  // Placeholder: no contact shown on screen for these deals
  { id: 'con-tbd', fullName: 'Contact TBD' },
];

export const SEED_DEALS: Deal[] = [
  {
    id: 'deal-enterprise',
    title: 'Enterprise License',
    summary: 'Annual enterprise license for 50 seats. Awaiting legal review.',
    stage: 'negotiation',
    value: { amount: 48000, currency: 'USD' },
    accountId: 'acc-tech',
    contactId: 'con-anna',
    isPublic: true,
  },
  {
    id: 'deal-pilot',
    title: 'Pilot Program',
    summary: '',
    stage: 'new',
    value: { amount: 12000, currency: 'USD' },
    accountId: 'acc-dataflow',
    contactId: 'con-tbd',
    isPublic: false,
  },
  {
    id: 'deal-design',
    title: 'Design Workshop',
    summary: '',
    stage: 'proposal',
    value: { amount: 5000, currency: 'USD' },
    accountId: 'acc-creative',
    contactId: 'con-tbd',
    isPublic: false,
  },
  {
    id: 'deal-renewal',
    title: 'Renewal',
    summary: '',
    stage: 'closed-lost',
    value: { amount: 24000, currency: 'USD' },
    accountId: 'acc-buildright',
    contactId: 'con-tbd',
    isPublic: false,
  },
];

export const SEED_TASKS: DealTask[] = [
  {
    id: 'task-1',
    dealId: 'deal-enterprise',
    title: 'Send revised proposal',
    dueDate: '2026-03-15',
    priority: 'high',
    done: false,
  },
  {
    id: 'task-2',
    dealId: 'deal-enterprise',
    title: 'Schedule call with legal',
    dueDate: '2026-03-10',
    priority: 'medium',
    done: true,
  },
];
