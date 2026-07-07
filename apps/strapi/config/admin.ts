export default {
  auth: {
    secret: process.env.ADMIN_JWT_SECRET,
  },
  apiToken: {
    salt: process.env.API_TOKEN_SALT,
  },
  transfer: {
    token: {
      salt: process.env.TRANSFER_TOKEN_SALT,
    },
  },
  flags: {
    nps: process.env.STRAPI_DISABLE_NPS === 'true',
  },
};
