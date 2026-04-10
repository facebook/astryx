import {defaultTheme as _theme} from './defaultTheme';
import type {XDSDefinedTheme} from '@xds/core/theme';

export const defaultTheme: XDSDefinedTheme = {..._theme, __built: true};
export {defaultIconRegistry} from './icons';
