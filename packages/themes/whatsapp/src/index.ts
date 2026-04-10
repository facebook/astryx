import {whatsappTheme as _theme} from './whatsappTheme';
import type {XDSDefinedTheme} from '@xds/core/theme';

/** Built theme — pair with `import '@xds/theme-whatsapp/theme.css'` */
export const whatsappTheme: XDSDefinedTheme = {..._theme, __built: true};
export {whatsappIconRegistry} from './icons';
