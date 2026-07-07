export default {
  /**
   * Application Strapi - point d'entree.
   * En Phase 1, aucune logique de register/bootstrap n'est necessaire.
   * Les content-types seront ajoutes en Phase 2.
   */
  register(/* { strapi } */) {
    // Reserve a Phase 2 : enregistrement des configurations de content-types.
  },

  bootstrap(/* { strapi } */) {
    // Reserve a Phase 2 : logique d'initialisation (roles, seed, etc.).
  },
};
