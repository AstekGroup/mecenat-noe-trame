import type { Core } from '@strapi/strapi';

import { configureFrenchContentManager } from './content-manager-labels';

export default {
  /**
   * Application Strapi - point d'entree.
   * Les schemas Strapi sont en TypeScript pour etre compiles proprement dans dist/.
   */
  register() {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await configureFrenchContentManager(strapi);
  },
};
