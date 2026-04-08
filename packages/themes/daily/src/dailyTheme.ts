import {defineTheme} from '@xds/core/theme';
import {dailyIconRegistry} from './icons';

export const dailyTheme = defineTheme({
  name: 'daily',
  typography: {
    body: {
      family: 'Figtree',
      fallbacks:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      url: 'https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&display=swap',
    },
  },
  tokens: {
    '--color-background-body': '#F9FAFA',
    '--radius-inner': '8px',
    '--radius-element': '12px',
    '--radius-container': '16px',
    '--radius-page': '32px',
  },
  icons: dailyIconRegistry,
});
