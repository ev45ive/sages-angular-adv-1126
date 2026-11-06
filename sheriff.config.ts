import type { SheriffConfig } from '@softarc/sheriff-core';

export const config: SheriffConfig = {
  modules: {
    'src/app/core': 'core',
    'src/app/shared': 'shared',
    'src/app/features/deals': 'feature:deals',
    'src/app/features/contacts': 'feature:contacts',
  },
  depRules: {
    root: ['root', 'core', 'shared', 'feature:*'],
    core: 'shared',
    shared: null,
    'feature:*': ['shared', 'feature:*'],
  },
};
