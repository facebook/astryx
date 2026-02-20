/**
 * @file theme command — Scaffold and apply XDS themes
 *
 * Interactive wizard that generates a complete theme file with:
 * - Preset selection (default, neutral, or custom brand)
 * - Brand color configuration for custom themes
 * - Component style override scaffolding
 * - Setup instructions for XDSTheme provider
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as p from '@clack/prompts';
import {findCoreDir} from '../utils/paths.mjs';

function isCancel(value) {
  if (p.isCancel(value)) {
    p.cancel('Theme setup cancelled.');
    process.exit(0);
  }
  return value;
}

// =============================================================================
// Color utilities
// =============================================================================

/**
 * Parse a hex color to RGB components
 */
function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return {r, g, b};
}

/**
 * Convert RGB to hex
 */
function rgbToHex(r, g, b) {
  const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
  return '#' + [r, g, b].map(v => clamp(v).toString(16).padStart(2, '0')).join('').toUpperCase();
}

/**
 * Mix two hex colors
 */
function mixColors(hex1, hex2, weight = 0.5) {
  const c1 = hexToRgb(hex1);
  const c2 = hexToRgb(hex2);
  return rgbToHex(
    c1.r * (1 - weight) + c2.r * weight,
    c1.g * (1 - weight) + c2.g * weight,
    c1.b * (1 - weight) + c2.b * weight,
  );
}

/**
 * Add alpha to a hex color
 */
function withAlpha(hex, alpha) {
  const alphaHex = Math.round(alpha * 255).toString(16).padStart(2, '0').toUpperCase();
  return hex + alphaHex;
}

/**
 * Derive a full color palette from a few key colors.
 *
 * @param {object} opts
 * @param {string} opts.accent - Primary accent color (hex)
 * @param {string} opts.positive - Success color (hex, optional)
 * @param {string} opts.negative - Error color (hex, optional)
 * @param {string} opts.warning - Warning color (hex, optional)
 * @param {'light'|'dark'|'both'} opts.mode - Color mode
 */
function deriveColorPalette({accent, positive, negative, warning, mode}) {
  positive = positive || '#0D8626';
  negative = negative || '#E3193B';
  warning = warning || '#E9AF08';

  const accentRgb = hexToRgb(accent);
  // Create a lighter version for dark mode accent
  const accentLight = rgbToHex(
    Math.min(255, accentRgb.r + 60),
    Math.min(255, accentRgb.g + 60),
    Math.min(255, accentRgb.b + 60),
  );
  const accentDark = accent;

  // Derive accent text (darker in light, lighter in dark)
  const accentTextLight = mixColors(accent, '#000000', 0.3);
  const accentTextDark = mixColors(accent, '#FFFFFF', 0.4);

  const ld = (light, dark) => {
    if (mode === 'light') return light;
    if (mode === 'dark') return dark;
    return `light-dark(${light}, ${dark})`;
  };

  return {
    // Core semantic
    '--color-accent': ld(accentDark, accentLight),
    '--color-accent-deemphasized': ld(withAlpha(accent, 0.2), withAlpha(accent, 0.25)),
    '--color-accent-text': ld(accentTextLight, accentTextDark),
    '--color-surface': ld('#FFFFFF', '#1F1F22'),
    '--color-wash': ld('#F1F4F7', '#111112'),
    '--color-overlay': ld('#01122866', '#11111299'),
    '--color-hover-overlay': ld('#0536590C', '#FFFFFF0C'),
    '--color-pressed-overlay': ld('#05365919', '#FFFFFF19'),
    '--color-focus-outline': ld(accentTextLight, accentTextDark),
    '--color-deemphasized': ld('#0536590C', '#1111127F'),

    // Text
    '--color-text-primary': ld('#0A1317', '#DFE2E5'),
    '--color-text-secondary': ld('#4E606F', '#AAAFB5'),
    '--color-text-disabled': ld('#A4B0BC', '#6F747C'),
    '--color-text-link': ld(accentDark, accentLight),
    '--color-text-placeholder': ld('#4E606F', '#AAAFB5'),
    '--color-text-on-media': ld('#FFFFFF', '#FFFFFF'),

    // Icon
    '--color-icon-primary': ld('#0A1317', '#DFE2E5'),
    '--color-icon-secondary': ld('#4E606F', '#AAAFB5'),
    '--color-icon-tertiary': ld('#748695', '#8C939B'),
    '--color-icon-disabled': ld('#A4B0BC', '#6F747C'),
    '--color-icon-on-media': ld('#FFFFFF', '#FFFFFF'),

    // Surface variants
    '--color-card': ld('#FFFFFF', '#1F1F22'),
    '--color-popover': ld('#FFFFFF', '#28292C'),
    '--color-navbar': ld('#FFFFFF', '#1F1F22'),

    // Status
    '--color-positive': ld(positive, positive),
    '--color-positive-deemphasized': ld(withAlpha(positive, 0.2), withAlpha(positive, 0.25)),
    '--color-negative': ld(negative, mixColors(negative, '#FF6666', 0.3)),
    '--color-negative-deemphasized': ld(withAlpha(negative, 0.2), withAlpha(negative, 0.25)),
    '--color-warning': ld(warning, mixColors(warning, '#FFCC00', 0.3)),
    '--color-warning-deemphasized': ld(withAlpha(warning, 0.2), withAlpha(warning, 0.25)),
    '--color-educational': ld('#5B08D8', '#6B1EFD'),
    '--color-educational-deemphasized': ld('#7952FF33', '#5B08D83F'),

    // Divider
    '--color-divider': ld('#05365919', '#F2F4F619'),
    '--color-divider-high-contrast': ld('#647685', '#6F747C'),
    '--color-divider-emphasized': ld('#CCD3DB', '#494D53'),

    // Disabled/Effects
    '--color-disabled-overlay': ld('#FFFFFF7F', '#1F1F227F'),
    '--color-glimmer': ld('#CCD3DB', '#5A5E66'),
    '--color-glimmer-high-contrast': ld('#A4B0BC', '#8C939B'),
    '--color-shadow-elevation': ld('rgba(5, 54, 89, 0.1)', 'rgba(0, 0, 0, 0.3)'),
    '--color-hover-tint': ld('black', 'white'),

    // Literal color sets
    '--color-blue-background': ld('#0171E333', '#0171E333'),
    '--color-blue-border': ld('#0171E3', '#4BA9FE'),
    '--color-blue-icon': ld('#0064E0', '#2694FE'),
    '--color-blue-text': ld('#042F97', '#AFD7FF'),
    '--color-cyan-background': ld('#00BCD433', '#00BCD433'),
    '--color-cyan-border': ld('#00BCD4', '#4DD0E1'),
    '--color-cyan-icon': ld('#00ACC1', '#26C6DA'),
    '--color-cyan-text': ld('#006064', '#B2EBF2'),
    '--color-gray-background': ld('#0A131733', '#666A724C'),
    '--color-gray-border': ld('#647685', '#8C939B'),
    '--color-gray-icon': ld('#4E606F', '#AAAFB5'),
    '--color-gray-text': ld('#0A1317', '#E7EAED'),
    '--color-green-background': ld('#24BB5E33', '#24BB5E33'),
    '--color-green-border': ld('#24BB5E', '#4CD964'),
    '--color-green-icon': ld('#0D8626', '#26A756'),
    '--color-green-text': ld('#09441F', '#A5F690'),
    '--color-orange-background': ld('#F2790233', '#F2790233'),
    '--color-orange-border': ld('#F27902', '#FFA040'),
    '--color-orange-icon': ld('#E9690B', '#FB8C00'),
    '--color-orange-text': ld('#6B2203', '#FDB876'),
    '--color-pink-background': ld('#E91E6333', '#E91E6333'),
    '--color-pink-border': ld('#E91E63', '#F48FB1'),
    '--color-pink-icon': ld('#C2185B', '#EC407A'),
    '--color-pink-text': ld('#880E4F', '#F8BBD0'),
    '--color-purple-background': ld('#7952FF33', '#7952FF33'),
    '--color-purple-border': ld('#7952FF', '#9575CD'),
    '--color-purple-icon': ld('#5B08D8', '#7952FF'),
    '--color-purple-text': ld('#3E0697', '#B3B0FE'),
    '--color-red-background': ld('#E3193B33', '#E3193B33'),
    '--color-red-border': ld('#E3193B', '#F5394F'),
    '--color-red-icon': ld('#D31130', '#E3193B'),
    '--color-red-text': ld('#7B0210', '#FFB2B8'),
    '--color-teal-background': ld('#0DB7AF33', '#0DB7AF33'),
    '--color-teal-border': ld('#0DB7AF', '#4DB6AC'),
    '--color-teal-icon': ld('#009688', '#26A69A'),
    '--color-teal-text': ld('#083943', '#40DCCD'),
    '--color-yellow-background': ld('#FFEB3B33', '#FFEB3B33'),
    '--color-yellow-border': ld('#FFEB3B', '#FFF176'),
    '--color-yellow-icon': ld('#FBC02D', '#FFEE58'),
    '--color-yellow-text': ld('#753F07', '#FBCE03'),
  };
}

// =============================================================================
// Theme file generation
// =============================================================================

/**
 * Generate the theme file content
 */
function generateThemeFile({name, exportName, colors, includeComponentOverrides, mode}) {
  const modeComment = mode === 'both'
    ? 'Uses CSS light-dark() for automatic light/dark mode switching.'
    : mode === 'dark'
      ? 'Designed for dark mode. Use with <XDSTheme mode="dark">.'
      : 'Designed for light mode. Use with <XDSTheme mode="light">.';

  const componentOverrideSection = includeComponentOverrides
    ? `
// =============================================================================
// Component Style Overrides (optional)
// =============================================================================
// Uncomment and customize any section below.
// Each component reads its overrides from theme.components.<name>.
//
// To discover what's themeable for a component, run:
//   npx xds component <Name> --compact
// and look for the "Theme Overrides" section.

// --- Button ---
// const buttonVariants = stylex.create({
//   secondary: {
//     backgroundColor: 'light-dark(rgba(0, 0, 0, 0.06), rgba(255, 255, 255, 0.1))',
//   },
// });

// --- Card ---
// const cardOverrides = stylex.create({
//   container: {
//     borderRadius: radiusVars['--radius-container'],
//     // gradient border: set a gradient background + padding, inner content covers it
//     // background: 'linear-gradient(135deg, ...)',
//   },
//   content: {
//     backgroundColor: colorVars['--color-card'],
//   },
// });

// --- Heading ---
// const headingStyles = stylex.create({
//   h1: {
//     fontFamily: typographyVars['--font-heading'],
//     fontSize: textSizeVars['--text-2xl'],
//     fontWeight: fontWeightVars['--font-weight-semibold'],
//     lineHeight: 1.2,
//     color: colorVars['--color-text-primary'],
//     margin: 0,
//   },
//   // h2, h3, h4, h5, h6...
// });

// --- Text ---
// const textStyles = stylex.create({
//   body: {
//     fontFamily: typographyVars['--font-body'],
//     fontSize: textSizeVars['--text-base'],
//     fontWeight: fontWeightVars['--font-weight-normal'],
//     lineHeight: lineHeightVars['--leading-base'],
//     color: colorVars['--color-text-primary'],
//     margin: 0,
//   },
//   // large, label, supporting, code...
// });
`
    : '';

  const componentsField = includeComponentOverrides
    ? `  // Uncomment to apply component overrides:
  // components: {
  //   button: { variants: buttonVariants },
  //   card: { container: cardOverrides.container, content: cardOverrides.content },
  //   heading: { styles: headingStyles },
  //   text: { styles: textStyles },
  // } as Theme['components'],`
    : '';

  // Format colors as source code
  const colorEntries = Object.entries(colors)
    .map(([key, value]) => `  '${key}': '${value}',`)
    .join('\n');

  return `/**
 * ${name} Theme
 *
 * ${modeComment}
 *
 * Generated by \`npx xds theme\`.
 * Customize the values below, then import in your app.
 */

import * as stylex from '@stylexjs/stylex';
import type {ThemeType as Theme} from '@xds/core/theme';
import {
  colorVars,
  spacingVars,
  sizeVars,
  radiusVars,
  elevationVars,
  transitionVars,
  typographyVars,
  textSizeVars,
  lineHeightVars,
  fontWeightVars,
} from '@xds/core/theme/tokens.stylex';
import type {
  BaseColorRaw,
  BaseSpacingRaw,
  BaseSizeRaw,
  BaseRadiusRaw,
  BaseElevationRaw,
  BaseTransitionRaw,
  BaseTypographyRaw,
  BaseTextSizeRaw,
  BaseLineHeightRaw,
  BaseFontWeightRaw,
} from '@xds/core/theme/tokens.stylex';

// =============================================================================
// Colors
// =============================================================================
// Edit these values to change your theme's color palette.
// Use light-dark(lightValue, darkValue) for automatic light/dark support.

const colorRaw = {
${colorEntries}
};

// =============================================================================
// Spacing, Size, Radius, Elevation, Transition, Typography
// =============================================================================
// These use XDS defaults. Override any values you want to customize.

const spacingRaw = {
  '--spacing-0': '0px',
  '--spacing-0-5': '2px',
  '--spacing-1': '4px',
  '--spacing-2': '8px',
  '--spacing-3': '12px',
  '--spacing-4': '16px',
  '--spacing-5': '20px',
  '--spacing-6': '24px',
  '--spacing-7': '28px',
  '--spacing-8': '32px',
  '--spacing-9': '36px',
  '--spacing-10': '40px',
  '--spacing-11': '44px',
  '--spacing-12': '48px',
};

const sizeRaw = {
  '--size-sm': '28px',
  '--size-md': '32px',
  '--size-lg': '36px',
};

const radiusRaw = {
  '--radius-rounded': '9999px',
  '--radius-container': '12px',
  '--radius-element': '8px',
  '--radius-content': '4px',
  '--radius-inner': '0px',
};

const elevationRaw = {
  '--elevation-base': '0px 0px 1px light-dark(rgba(0, 0, 0, 0.1), #111112)',
  '--elevation-thumb': '0 1px 3px light-dark(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.4))',
  '--elevation-dialog': '0px 2px 2px light-dark(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2)), 0px 8px 24px light-dark(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.3))',
  '--elevation-hover': '0px 1px 2px light-dark(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2)), 0px 2px 12px light-dark(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2))',
  '--elevation-menu': '0px 1px 1px light-dark(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2)), 0px 2px 8px light-dark(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2))',
};

const transitionRaw = {
  '--transition-fast': '0.15s ease',
  '--transition-normal': '0.2s ease',
};

const typographyRaw = {
  '--font-body': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  '--font-code': '"SF Mono", Monaco, Consolas, monospace',
  '--font-heading': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
};

const textSizeRaw = {
  '--text-4xs': '0.5rem',
  '--text-3xs': '0.625rem',
  '--text-2xs': '0.6875rem',
  '--text-xsm': '0.75rem',
  '--text-sm': '0.8125rem',
  '--text-base': '0.875rem',
  '--text-lg': '1rem',
  '--text-xl': '1.125rem',
  '--text-2xl': '1.25rem',
  '--text-3xl': '1.5rem',
  '--text-4xl': '2rem',
};

const lineHeightRaw = {
  '--leading-tight': '1.25',
  '--leading-snug': '1.375',
  '--leading-base': '1.4285714285714286',
  '--leading-normal': '1.5',
  '--leading-relaxed': '1.625',
};

const fontWeightRaw = {
  '--font-weight-normal': '400',
  '--font-weight-medium': '500',
  '--font-weight-semibold': '600',
  '--font-weight-bold': '700',
};

// =============================================================================
// createTheme calls
// =============================================================================

const colorTheme = stylex.createTheme(colorVars, colorRaw as unknown as BaseColorRaw);
const spacingTheme = stylex.createTheme(spacingVars, spacingRaw as unknown as BaseSpacingRaw);
const sizeTheme = stylex.createTheme(sizeVars, sizeRaw as unknown as BaseSizeRaw);
const radiusTheme = stylex.createTheme(radiusVars, radiusRaw as unknown as BaseRadiusRaw);
const elevationTheme = stylex.createTheme(elevationVars, elevationRaw as unknown as BaseElevationRaw);
const transitionTheme = stylex.createTheme(transitionVars, transitionRaw as unknown as BaseTransitionRaw);
const typographyTheme = stylex.createTheme(typographyVars, typographyRaw as unknown as BaseTypographyRaw);
const textSizeTheme = stylex.createTheme(textSizeVars, textSizeRaw as unknown as BaseTextSizeRaw);
const lineHeightTheme = stylex.createTheme(lineHeightVars, lineHeightRaw as unknown as BaseLineHeightRaw);
const fontWeightTheme = stylex.createTheme(fontWeightVars, fontWeightRaw as unknown as BaseFontWeightRaw);
${componentOverrideSection}
// =============================================================================
// Theme Export
// =============================================================================

export const ${exportName}: Theme = {
  name: '${name.toLowerCase().replace(/\s+/g, '-')}',
  styles: {
    colors: colorTheme,
    spacing: spacingTheme,
    size: sizeTheme,
    radius: radiusTheme,
    elevation: elevationTheme,
    transition: transitionTheme,
    typography: typographyTheme,
    textSize: textSizeTheme,
    lineHeight: lineHeightTheme,
    fontWeight: fontWeightTheme,
  },
  raw: {
    colors: colorRaw,
    spacing: spacingRaw,
    size: sizeRaw,
    radius: radiusRaw,
    elevation: elevationRaw,
    transition: transitionRaw,
    typography: typographyRaw,
    textSize: textSizeRaw,
    lineHeight: lineHeightRaw,
    fontWeight: fontWeightRaw,
  },
${componentsField}
};
`;
}

/**
 * Validate hex color input
 */
function isValidHex(value) {
  return /^#?[0-9A-Fa-f]{6}$/.test(value);
}

function normalizeHex(value) {
  const clean = value.replace('#', '');
  return '#' + clean.toUpperCase();
}

// =============================================================================
// Preset color palettes
// =============================================================================

const PRESETS = {
  default: {
    description: 'XDS branded — blue accent, system fonts',
    accent: '#0064E0',
  },
  neutral: {
    description: 'Grayscale — shadcn-inspired, minimal color',
    accent: '#18181B',
  },
};

// =============================================================================
// Command registration
// =============================================================================

// Keep these exports for backwards compat with init.mjs
export function discoverThemes(coreDir) {
  // Check packages/theme/ (monorepo) and packages/core/src/theme/ (legacy)
  const searchDirs = [
    path.join(coreDir, '..', 'theme', 'src'),
    path.join(coreDir, 'src', 'theme'),
  ];

  const themes = [];
  for (const searchDir of searchDirs) {
    if (!fs.existsSync(searchDir)) continue;

    // Scan subdirectories for *Theme.stylex.ts
    const entries = fs.readdirSync(searchDir, {withFileTypes: true});
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const dirPath = path.join(searchDir, entry.name);
        const files = fs.readdirSync(dirPath);
        for (const f of files) {
          if (f.endsWith('Theme.stylex.ts')) {
            const exportName = f.replace('.stylex.ts', '');
            const name = exportName.replace('Theme', '');
            themes.push({name, exportName});
          }
        }
      } else if (entry.name.endsWith('Theme.stylex.ts')) {
        const exportName = entry.name.replace('.stylex.ts', '');
        const name = exportName.replace('Theme', '');
        themes.push({name, exportName});
      }
    }
  }

  // Deduplicate by name
  const seen = new Set();
  return themes
    .filter(t => {
      if (seen.has(t.name)) return false;
      seen.add(t.name);
      return true;
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function writeThemeConfig(targetDir, themeExportName) {
  const configPath = path.join(targetDir, 'xds.config.mjs');
  const content = `/**
 * XDS Configuration
 * Generated by \`xds theme\`
 */
export default {
  theme: '${themeExportName}',
};
`;
  fs.writeFileSync(configPath, content);
  return configPath;
}

export function registerTheme(program) {
  program
    .command('theme [preset]')
    .description('Scaffold a custom XDS theme')
    .option('--list', 'List existing themes in this project')
    .option('--output <path>', 'Output file path', './src/theme/customTheme.stylex.ts')
    .action(async (preset, options) => {
      // Non-interactive: --list
      if (options.list) {
        const coreDir = findCoreDir(process.cwd());
        if (!coreDir) {
          console.error('Error: Could not find @xds/core package.');
          process.exit(1);
        }

        const themes = discoverThemes(coreDir);
        if (themes.length === 0) {
          console.log('\nNo themes found. Run `npx xds theme` to create one.\n');
        } else {
          console.log('\nExisting themes:\n');
          for (const theme of themes) {
            console.log(`  ${theme.name} — import { ${theme.exportName} } from '@xds/theme/${theme.name}'`);
          }
          console.log('');
        }
        return;
      }

      // Non-interactive: preset name provided directly
      if (preset && PRESETS[preset]) {
        const colors = deriveColorPalette({
          accent: PRESETS[preset].accent,
          mode: 'both',
        });
        const exportName = `${preset}Theme`;
        const content = generateThemeFile({
          name: preset.charAt(0).toUpperCase() + preset.slice(1),
          exportName,
          colors,
          includeComponentOverrides: false,
          mode: 'both',
        });

        const outputPath = path.resolve(process.cwd(), options.output);
        fs.mkdirSync(path.dirname(outputPath), {recursive: true});
        fs.writeFileSync(outputPath, content);

        console.log(`\n✓ Generated ${path.relative(process.cwd(), outputPath)}\n`);
        printSetupInstructions(outputPath, exportName);
        return;
      }

      // =====================================================================
      // Interactive mode
      // =====================================================================
      p.intro('XDS Theme Scaffold');

      // Step 1: Choose starting point
      const startingPoint = isCancel(
        await p.select({
          message: 'How would you like to start?',
          options: [
            {value: 'brand', label: 'Custom brand', hint: 'Pick your accent color, we derive the rest'},
            {value: 'default', label: 'Copy Default theme', hint: 'Blue accent, full light/dark support'},
            {value: 'neutral', label: 'Copy Neutral theme', hint: 'Grayscale, shadcn-inspired'},
            {value: 'minimal', label: 'Minimal scaffold', hint: 'Just the structure, you fill in colors'},
          ],
        }),
      );

      let colors;
      let themeName;
      let mode = 'both';

      if (startingPoint === 'brand') {
        // Step 2a: Brand color
        const accentInput = isCancel(
          await p.text({
            message: 'Accent color (hex)',
            placeholder: '#7B61FF',
            initialValue: '#7B61FF',
            validate: (value) => {
              if (!isValidHex(value)) return 'Enter a valid hex color (e.g., #7B61FF)';
            },
          }),
        );
        const accent = normalizeHex(accentInput);

        // Step 2b: Color mode
        mode = isCancel(
          await p.select({
            message: 'Color mode',
            options: [
              {value: 'both', label: 'Light + Dark', hint: 'Automatic via light-dark() — recommended'},
              {value: 'light', label: 'Light only'},
              {value: 'dark', label: 'Dark only'},
            ],
          }),
        );

        // Step 2c: Status colors
        const customizeStatus = isCancel(
          await p.confirm({
            message: 'Customize status colors (positive/negative/warning)?',
            initialValue: false,
          }),
        );

        let positive, negative, warning;
        if (customizeStatus) {
          positive = normalizeHex(isCancel(
            await p.text({
              message: 'Positive/success color',
              placeholder: '#0D8626',
              initialValue: '#0D8626',
              validate: (v) => { if (!isValidHex(v)) return 'Enter a valid hex color'; },
            }),
          ));
          negative = normalizeHex(isCancel(
            await p.text({
              message: 'Negative/error color',
              placeholder: '#E3193B',
              initialValue: '#E3193B',
              validate: (v) => { if (!isValidHex(v)) return 'Enter a valid hex color'; },
            }),
          ));
          warning = normalizeHex(isCancel(
            await p.text({
              message: 'Warning color',
              placeholder: '#E9AF08',
              initialValue: '#E9AF08',
              validate: (v) => { if (!isValidHex(v)) return 'Enter a valid hex color'; },
            }),
          ));
        }

        colors = deriveColorPalette({accent, positive, negative, warning, mode});

        // Step 2d: Theme name
        themeName = isCancel(
          await p.text({
            message: 'Theme name',
            placeholder: 'myBrand',
            initialValue: 'myBrand',
            validate: (v) => {
              if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(v)) return 'Use camelCase, letters and numbers only';
            },
          }),
        );

      } else if (startingPoint === 'default' || startingPoint === 'neutral') {
        colors = deriveColorPalette({
          accent: PRESETS[startingPoint].accent,
          mode: 'both',
        });
        themeName = isCancel(
          await p.text({
            message: 'Theme name',
            placeholder: `my${startingPoint.charAt(0).toUpperCase() + startingPoint.slice(1)}`,
            initialValue: `my${startingPoint.charAt(0).toUpperCase() + startingPoint.slice(1)}`,
            validate: (v) => {
              if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(v)) return 'Use camelCase, letters and numbers only';
            },
          }),
        );
      } else {
        // Minimal — use default colors as placeholder
        colors = deriveColorPalette({accent: '#0064E0', mode: 'both'});
        themeName = isCancel(
          await p.text({
            message: 'Theme name',
            placeholder: 'myTheme',
            initialValue: 'myTheme',
            validate: (v) => {
              if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(v)) return 'Use camelCase, letters and numbers only';
            },
          }),
        );
      }

      // Step 3: Component overrides
      const includeComponentOverrides = isCancel(
        await p.confirm({
          message: 'Include component style override scaffolding?',
          initialValue: true,
        }),
      );

      // Step 4: Output path
      const exportName = `${themeName}Theme`;
      const defaultOutput = `./src/theme/${themeName}Theme.stylex.ts`;
      const outputPath = isCancel(
        await p.text({
          message: 'Output path',
          placeholder: defaultOutput,
          initialValue: defaultOutput,
        }),
      );

      // Generate and write
      const content = generateThemeFile({
        name: themeName.charAt(0).toUpperCase() + themeName.slice(1),
        exportName,
        colors,
        includeComponentOverrides,
        mode,
      });

      const resolvedPath = path.resolve(process.cwd(), outputPath);
      fs.mkdirSync(path.dirname(resolvedPath), {recursive: true});
      fs.writeFileSync(resolvedPath, content);

      p.log.success(`Generated ${path.relative(process.cwd(), resolvedPath)}`);

      // Step 5: Setup instructions
      const modeAttr = mode === 'dark' ? ' mode="dark"' : mode === 'light' ? ' mode="light"' : '';

      p.note(
        `import {XDSTheme} from '@xds/core';\n` +
        `import {${exportName}} from './${path.relative(path.resolve(process.cwd(), 'src'), resolvedPath).replace('.stylex.ts', '')}';\n` +
        `\n` +
        `<XDSTheme theme={${exportName}}${modeAttr}>\n` +
        `  <App />\n` +
        `</XDSTheme>`,
        'Add to your root layout',
      );

      if (mode !== 'both') {
        p.log.info(
          `Your theme is ${mode}-mode only. Make sure to set mode="${mode}" on XDSTheme.`,
        );
      }

      p.note(
        'Edit the colorRaw object to change colors.\n' +
        'Edit spacingRaw, radiusRaw, etc. to customize other tokens.\n' +
        (includeComponentOverrides
          ? 'Uncomment sections in "Component Style Overrides" to customize components.\n'
          : 'Run `npx xds theme` again with component overrides to customize components.\n') +
        '\nRun `npx xds docs tokens` to see all available tokens.',
        'Next steps',
      );

      p.outro('Theme ready!');
    });
}

/**
 * Print setup instructions (non-interactive mode)
 */
function printSetupInstructions(outputPath, exportName) {
  const relPath = path.relative(process.cwd(), outputPath).replace('.stylex.ts', '');
  console.log('Add to your root layout:\n');
  console.log(`  import {XDSTheme} from '@xds/core';`);
  console.log(`  import {${exportName}} from './${relPath}';`);
  console.log('');
  console.log(`  <XDSTheme theme={${exportName}}>`);
  console.log('    <App />');
  console.log('  </XDSTheme>\n');
}
