export { default as dealsRoutes } from './deals.routes';

export { CONTACT_DIRECTORY } from './data/contact-directory.port';
export type { ContactDirectory, ContactOption } from './data/contact-directory.port';
export { DEALS_BY_CONTACT } from './data/deals.ports';
export type { DealsByContactSource } from './data/deals.ports';
export { DEAL_STAGE_LABELS } from './model/deal.model';
export type { Deal, DealStage } from './model/deal.model';
