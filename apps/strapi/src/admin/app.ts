interface CustomFieldDescriptor {
  name: string;
  type: 'json';
  intlLabel: {
    id: string;
    defaultMessage: string;
  };
  intlDescription: {
    id: string;
    defaultMessage: string;
  };
  components: {
    Input: () => Promise<{ default: unknown }>;
  };
}

interface AdminApp {
  customFields: {
    register: (descriptor: CustomFieldDescriptor) => void;
  };
}

export default {
  config: {
    locales: ['fr'],
    translations: {
      fr: {
        'Content Manager': 'Gestionnaire de contenu',
        'Content Type Builder': 'Constructeur de types de contenu',
        'content-manager.plugin.name': 'Gestionnaire de contenu',
        'search.placeholder': 'Rechercher',
        'content-manager.search.placeholder': 'Rechercher',
        'content-manager.preview.panel.title': 'Aperçu',
        'content-manager.preview.panel.button-configuration': 'Configurer l’aperçu',
        'content-type-builder.plugin.name': 'Constructeur de types de contenu',
        'global.content-manager': 'Gestion du contenu',
        'global.plugins.content-manager': 'Gestionnaire de contenu',
        'global.marketplace': 'Catalogue d’extensions',
        'app.HeaderLayout.docLink.label': 'En savoir plus dans la documentation',
        'tours.profile.title': 'Visite guidée',
        'tours.profile.description': 'Vous pouvez relancer la visite guidée à tout moment.',
        'tours.profile.reset': 'Relancer la visite guidée',
        'tours.profile.notification.success.reset': 'Visite guidée relancée',
      },
    },
  },
  register(app: AdminApp) {
    app.customFields.register({
      name: 'checkbox-list',
      type: 'json',
      intlLabel: {
        id: 'custom-fields.checkbox-list.label',
        defaultMessage: 'Liste de cases à cocher',
      },
      intlDescription: {
        id: 'custom-fields.checkbox-list.description',
        defaultMessage:
          'Champ JSON affiché comme une liste de cases à cocher, avec des choix configurables.',
      },
      components: {
        Input: async () => import('./components/CheckboxListInput'),
      },
    });
  },
  bootstrap() {},
};
