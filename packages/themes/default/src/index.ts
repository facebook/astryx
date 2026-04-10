import {defaultTheme as _theme} from './defaultTheme';
import type {XDSDefinedTheme} from '@xds/core/theme';

/** Built theme — pair with `import '@xds/theme-default/theme.css'` */
export const defaultTheme: XDSDefinedTheme = {..._theme, __built: true};
export {defaultIconRegistry} from './icons';
