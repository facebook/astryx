import {metaTheme as _theme} from './metaTheme';
import type {XDSDefinedTheme} from '@xds/core/theme';

/** Built theme — pair with `import '@xds/theme-meta/theme.css'` */
export const metaTheme: XDSDefinedTheme = {..._theme, __built: true};
export {metaIconRegistry} from './icons';
