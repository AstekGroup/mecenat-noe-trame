export default {
  host: process.env.HOST || '0.0.0.0',
  port: process.env.PORT || 1337,
  app: {
    keys: (process.env.APP_KEYS || '').split(',').map((k) => k.trim()).filter(Boolean),
  },
  webhooks: {
    populateRelations: process.env.WEBHOOKS_POPULATE_RELATIONS === 'true',
  },
};
