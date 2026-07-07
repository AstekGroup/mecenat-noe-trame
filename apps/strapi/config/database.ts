import path from 'node:path';

export default {
  connection: {
    client: 'sqlite',
    connection: {
      // process.cwd() = apps/strapi (la ou Strapi est lance).
      // On evite __dirname qui pointe vers dist/config/ apres compilation TS,
      // car dist/ est nettoye a chaque demarrage.
      filename: path.join(process.cwd(), 'data', 'strapi.db'),
    },
    useNullAsDefault: true,
  },
};
