import type { Core } from '@strapi/strapi';

import { configureFrenchContentManager } from './content-manager-labels';

export default {
  /**
   * Application Strapi - point d'entree.
   * Les schemas Strapi sont en TypeScript pour etre compiles proprement dans dist/.
   */
  register({ strapi }: { strapi: Core.Strapi }) {
    strapi.customFields.register({
      name: 'checkbox-list',
      type: 'json',
      inputSize: {
        default: 6,
        isResizable: true,
      },
    });
  },

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await configureFrenchContentManager(strapi);
  },
};
