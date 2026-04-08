/**
 * XDS VS Code Theme
 *
 * Maps VS Code's --vscode-* CSS custom properties to XDS design tokens,
 * allowing XDS components to render natively inside VS Code webviews.
 *
 * VS Code injects ~700 CSS custom properties into every webview that
 * dynamically update when the user switches themes. This theme reads
 * those vars so XDS components automatically adapt to any VS Code theme
 * (light, dark, high contrast, custom).
 *
 * Usage in a VS Code webview:
 *   import { vscodeTheme } from '@xds/theme-vscode';
 *   <XDSTheme theme={vscodeTheme}><App /></XDSTheme>
 */

import {defineTheme} from '@xds/core/theme';

export const vscodeTheme = defineTheme({
  name: 'vscode',

  tokens: {
    // =========================================================================
    // Core Semantic Colors
    // =========================================================================
    '--color-accent': 'var(--vscode-button-background)',
    '--color-accent-deemphasized':
      'color-mix(in srgb, var(--vscode-button-background) 20%, transparent)',
    '--color-accent-text': 'var(--vscode-textLink-foreground)',

    // Surfaces
    '--color-surface': 'var(--vscode-editor-background)',
    '--color-wash': 'var(--vscode-sideBar-background, var(--vscode-editor-background))',
    '--color-overlay':
      'color-mix(in srgb, var(--vscode-editor-background) 70%, transparent)',

    // Interaction overlays
    '--color-hover-overlay':
      'color-mix(in srgb, var(--vscode-list-hoverBackground) 40%, transparent)',
    '--color-pressed-overlay':
      'color-mix(in srgb, var(--vscode-list-activeSelectionBackground) 30%, transparent)',

    // Focus
    '--color-focus-outline': 'var(--vscode-focusBorder)',
    '--color-focus-outline-error': 'var(--vscode-editorError-foreground)',
    '--color-focus-outline-success': 'var(--vscode-testing-iconPassed)',
    '--color-focus-outline-warning': 'var(--vscode-editorWarning-foreground)',

    '--color-deemphasized':
      'color-mix(in srgb, var(--vscode-foreground) 8%, transparent)',

    // =========================================================================
    // Text Colors
    // =========================================================================
    '--color-text-primary': 'var(--vscode-foreground)',
    '--color-text-secondary': 'var(--vscode-descriptionForeground)',
    '--color-text-disabled':
      'color-mix(in srgb, var(--vscode-foreground) 40%, transparent)',
    '--color-text-link': 'var(--vscode-textLink-foreground)',
    '--color-text-placeholder': 'var(--vscode-input-placeholderForeground)',
    '--color-text-on-media': 'var(--vscode-button-foreground)',

    // =========================================================================
    // Icon Colors
    // =========================================================================
    '--color-icon-primary': 'var(--vscode-foreground)',
    '--color-icon-secondary': 'var(--vscode-descriptionForeground)',
    '--color-icon-tertiary':
      'color-mix(in srgb, var(--vscode-descriptionForeground) 70%, transparent)',
    '--color-icon-disabled':
      'color-mix(in srgb, var(--vscode-foreground) 40%, transparent)',
    '--color-icon-on-media': 'var(--vscode-button-foreground)',

    // =========================================================================
    // Surface Variants
    // =========================================================================
    '--color-card': 'var(--vscode-editorWidget-background)',
    '--color-popover': 'var(--vscode-editorHoverWidget-background)',
    '--color-navbar': 'var(--vscode-editor-background)',

    // =========================================================================
    // Status / Sentiment
    // =========================================================================
    '--color-positive': 'var(--vscode-testing-iconPassed)',
    '--color-positive-deemphasized':
      'color-mix(in srgb, var(--vscode-testing-iconPassed) 20%, transparent)',
    '--color-negative': 'var(--vscode-editorError-foreground)',
    '--color-negative-deemphasized':
      'color-mix(in srgb, var(--vscode-editorError-foreground) 20%, transparent)',
    '--color-warning': 'var(--vscode-editorWarning-foreground)',
    '--color-warning-deemphasized':
      'color-mix(in srgb, var(--vscode-editorWarning-foreground) 20%, transparent)',
    '--color-educational': 'var(--vscode-notificationsInfoIcon-foreground)',
    '--color-educational-deemphasized':
      'color-mix(in srgb, var(--vscode-notificationsInfoIcon-foreground) 20%, transparent)',

    // =========================================================================
    // Divider
    // =========================================================================
    '--color-divider': 'var(--vscode-panel-border)',
    '--color-divider-high-contrast':
      'var(--vscode-contrastBorder, var(--vscode-panel-border))',
    '--color-divider-emphasized': 'var(--vscode-editorWidget-border)',

    // =========================================================================
    // Disabled / Effects
    // =========================================================================
    '--color-disabled-overlay':
      'color-mix(in srgb, var(--vscode-editor-background) 50%, transparent)',
    '--color-glimmer':
      'color-mix(in srgb, var(--vscode-foreground) 15%, transparent)',
    '--color-glimmer-high-contrast':
      'color-mix(in srgb, var(--vscode-foreground) 25%, transparent)',
    '--color-shadow-elevation': 'rgba(0, 0, 0, 0.2)',
    '--color-hover-tint': 'var(--vscode-foreground)',

    // =========================================================================
    // Typography
    // =========================================================================
    '--font-body': 'var(--vscode-font-family)',
    '--font-heading': 'var(--vscode-font-family)',
    '--font-code': 'var(--vscode-editor-font-family)',

    // VS Code uses 13px base — scale XDS text sizes to match
    '--text-base': '13px',
    '--text-xsm': '11px',
    '--text-sm': '12px',
    '--text-lg': '14px',
    '--text-xl': '16px',
    '--text-2xl': '18px',
    '--text-3xl': '22px',
    '--text-4xl': '28px',

    // =========================================================================
    // Radius — VS Code uses tighter radii
    // =========================================================================
    '--radius-container': '8px',
    '--radius-element': '4px',
    '--radius-content': '2px',
  },

  components: {
    button: {
      base: {
        borderRadius: '2px',
      },
      'variant:secondary': {
        backgroundColor: 'var(--vscode-button-secondaryBackground)',
        color: 'var(--vscode-button-secondaryForeground)',
      },
    },

    card: {
      base: {
        backgroundColor: 'var(--vscode-editorWidget-background)',
        borderColor: 'var(--vscode-editorWidget-border)',
      },
    },

    text: {
      'type:code': {
        fontFamily: 'var(--vscode-editor-font-family)',
      },
    },
  },
});
