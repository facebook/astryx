import {dailyTheme as _theme} from './dailyTheme';
import type {XDSDefinedTheme} from '@xds/core/theme';

/** Built theme — pair with `import '@xds/theme-daily/theme.css'` */
export const dailyTheme: XDSDefinedTheme = {..._theme, __built: true};
export {dailyIconRegistry} from './icons';
