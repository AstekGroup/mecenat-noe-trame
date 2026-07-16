import type { Core } from '@strapi/strapi';

const PROJECT_CONTRACT_UIDS = new Set([
  'api::project.project',
  'api::department.department',
  'api::partner.partner',
  'api::projecttype.projecttype',
  'api::habitattype.habitattype',
]);
const MUTATING_ACTIONS = new Set([
  'create',
  'update',
  'delete',
  'publish',
  'unpublish',
  'discardDraft',
]);

export function registerProjectCacheInvalidation(strapi: Core.Strapi) {
  const backendUrl = process.env.BACKEND_API_URL?.replace(/\/+$/, '');
  const secret = process.env.PROJECT_CACHE_INVALIDATION_SECRET;

  if (!backendUrl || !secret) {
    strapi.log.warn(
      'Invalidation du cache projets désactivée : BACKEND_API_URL ou PROJECT_CACHE_INVALIDATION_SECRET absent.',
    );
    return;
  }

  strapi.documents.use(async (context, next) => {
    const result = await next();

    if (
      PROJECT_CONTRACT_UIDS.has(context.uid) &&
      MUTATING_ACTIONS.has(context.action)
    ) {
      try {
        const response = await fetch(
          `${backendUrl}/api/projects/cache/invalidate`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${secret}`,
            },
            signal: AbortSignal.timeout(2_000),
          },
        );

        if (!response.ok) {
          strapi.log.error(
            `Échec de l’invalidation du cache projets (${response.status}).`,
          );
        }
      } catch (error) {
        strapi.log.error(
          `Backend indisponible pendant l’invalidation du cache projets : ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    return result;
  });
}
