import {neutralTheme as _theme} from './neutralTheme';
import type {XDSDefinedTheme} from '@xds/core/theme';

/** Built theme — pair with `import '@xds/theme-neutral/theme.css'` */
export const neutralTheme: XDSDefinedTheme = {..._theme, __built: true};
export {neutralIconRegistry} from './icons';
