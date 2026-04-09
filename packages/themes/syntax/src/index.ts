/**
 * @xds/theme-syntax — Community syntax theme presets for XDS
 *
 * 11 themes (6 dark, 5 light) mapped to the XDS 14-token syntax architecture.
 * All original themes are MIT licensed. See THIRD_PARTY_LICENSES.md.
 *
 * @example
 * import {dracula} from '@xds/theme-syntax';
 * import {XDSCodeTheme} from '@xds/core/theme';
 *
 * <XDSCodeTheme theme={dracula}>
 *   <XDSCodeBlock code={code} />
 * </XDSCodeTheme>
 */

// Dark themes
export {oneDarkPro} from './presets';
export {dracula} from './presets';
export {monokai} from './presets';
export {nord} from './presets';
export {tokyoNight} from './presets';
export {catppuccinMocha} from './presets';

// Light themes
export {githubLight} from './presets';
export {solarizedLight} from './presets';
export {oneLight} from './presets';
export {catppuccinLatte} from './presets';
export {tokyoNightLight} from './presets';

// Collections
export {darkSyntaxPresets, lightSyntaxPresets, allSyntaxPresets} from './presets';
