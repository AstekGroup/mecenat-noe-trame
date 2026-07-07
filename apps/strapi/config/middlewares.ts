export default [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  {
    name: 'strapi::body',
    config: {
      formLimit: '85mb',
      jsonLimit: '85mb',
      textLimit: '85mb',
    },
  },
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
