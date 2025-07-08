/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Composables
import { createVuetify } from 'vuetify'
import { VCardActions } from 'vuetify/components'



// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: 'customLightTheme',
    themes: {
      customLightTheme: {
        dark: false,
        colors: {
          primary: '#1E3A8A',
          secondary: '#3B82F6',
          tertiary: '#10B981',
          background: '#F3F4F6',
          surface: '#FFFFFF',
          /*
          error: '',
          warning: '',
          success: ''
          */
        },
      },
      customDarkTheme: {
        dark: true,
        colors: {
          /*
          primary: '',
          secondary: '',
          tertiary: '',
          background: '',
          surface: '',
          error: '',
          warning: '',
          success: ''
          */
        },
      },
    },
  },
  defaults: {
    /* Defaults for global */
    global: {
      rounded: 'lg'
    },
    /* Defaults for layout app */
    VAppBar: {
      elevation: 0,
      rounded: 0,
      density: 'comfortable',
      VAppBarTitle: {
        class: 'font-weight-bold'
      }
    },
    VNavigationDrawer: {
      class: 'border-0',
      rounded: 0,
    },
    VToolbar: {
      color: 'surface',
      density: 'comfortable',
      VToolbarTitle: {
        class: 'text-h6 font-weight-bold text-medium-emphasis'
      },
      VDivider: {
        inset: true,
        vertical: true,
        class: 'mx-4'
      }
    },
    /* Defaults to data */
    VDataTable: {
      mobile: null,
      mobileBreakpoint: 'sm',
      VChip: {
        color: 'secondary'
      }
    },
    VRadioGroup: {
      VLabel: {
        style: 'white-space: normal !important;'
      }
    },
    VContainer: {
      fluid: false,
    },
    VList: {
      slim: true,
    },
    VWindow: {
      touch: false,
    },
    VCarousel: {
      VBtn: {
        size: 'x-small',
        variant: 'flat'
      }
    },
    /* Defaults for feedback */
    VTabs: {
      color: 'primary',
      VTab: {
        class: 'text-body-2'
      }
    },
    VChip: {
      class: 'text-caption font-weight-medium',
    },
    VTooltip: {
      openDelay: 300,
      closeDelay: 100,
      location: 'top',
      contentClass: 'bg-primary font-weight-medium'
    },
    VCard: {
      variant: 'flat',
      VCardTitle: {
        class: 'text-h6 font-weight-bold text-medium-emphasis'
      },
      VCardSubtitle: {
        class: 'text-body-2'
      },
      VCardActions: {
        VBtn: {
          slim: false
        }
      },
    },
    /* Defaults to forms */
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
      color: 'primary',
      counter: true
    },
    VAutocomplete: {
      variant: 'outlined',
      density: 'comfortable',
      color: 'primary'
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable',
      color: 'primary'
    },
    VTextarea: {
      variant: 'outlined',
      autoGrow: true,
      density: 'comfortable',
      color: 'primary',
      rows: 3,
      counter: true
    },
    VFileInput: {
      variant: 'outlined',
      density: 'comfortable',
      color: 'primary',
      clearable: true,
      chips: true,
      counter: true,
      showSize: 1024,
      persistentHint: true
    },
    VCheckbox: {
      color: 'primary',
      density: 'comfortable'
    }
  }
})
