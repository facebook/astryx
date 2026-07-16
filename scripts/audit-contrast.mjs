#!/usr/bin/env node
/**
 * Auditoría de contraste WCAG 2.1 AA — enfocada en los casos del issue #3654.
 *
 * Mide pares foreground/background relevantes para componentes de UI:
 *   - Texto sobre surface/body/card/popover
 *   - Iconos sobre surface/body/card/popover
 *   - Bordes sobre surface/body/card/popover
 *
 * Y propone valores de fix para los que no cumplen.
 */

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  if (hex.length === 8) hex = hex.slice(0, 6);
  return { r: parseInt(hex.slice(0, 2), 16), g: parseInt(hex.slice(2, 4), 16), b: parseInt(hex.slice(4, 6), 16) };
}

function srgbChannel(c) {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * srgbChannel(r) + 0.7152 * srgbChannel(g) + 0.0722 * srgbChannel(b);
}

function contrastRatio(hex1, hex2) {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function findColorForTarget(fg, bg, targetRatio, direction) {
  // Busca un color fg' que dé targetRatio contra bg
  // direction: 'darker' o 'lighter'
  const lbg = relativeLuminance(bg);
  const targetL = targetRatio * (lbg + 0.05) - 0.05;
  
  // Convertir targetL a hex aproximado (escala de grises para simplificar)
  // En la práctica ajustamos el canal más cercano
  return null; // placeholder
}

// =============================================================================
// Tokens a auditar (los que realmente importan para UI)
// =============================================================================

const PAIRS = [
  // Texto sobre fondos principales
  { token: '--color-text-primary', fg: '#0A1317', bg: '#FFFFFF', bgName: 'surface', type: 'regular' },
  { token: '--color-text-primary', fg: '#0A1317', bg: '#F1F4F7', bgName: 'body', type: 'regular' },
  { token: '--color-text-secondary', fg: '#4E606F', bg: '#FFFFFF', bgName: 'surface', type: 'regular' },
  { token: '--color-text-secondary', fg: '#4E606F', bg: '#F1F4F7', bgName: 'body', type: 'regular' },
  { token: '--color-text-disabled', fg: '#A4B0BC', bg: '#FFFFFF', bgName: 'surface', type: 'regular' },
  { token: '--color-text-disabled', fg: '#A4B0BC', bg: '#F1F4F7', bgName: 'body', type: 'regular' },
  { token: '--color-text-accent', fg: '#0064E0', bg: '#FFFFFF', bgName: 'surface', type: 'regular' },
  { token: '--color-text-accent', fg: '#0064E0', bg: '#F1F4F7', bgName: 'body', type: 'regular' },

  // Iconos sobre fondos principales
  { token: '--color-icon-primary', fg: '#0A1317', bg: '#FFFFFF', bgName: 'surface', type: 'non-text' },
  { token: '--color-icon-primary', fg: '#0A1317', bg: '#F1F4F7', bgName: 'body', type: 'non-text' },
  { token: '--color-icon-secondary', fg: '#4E606F', bg: '#FFFFFF', bgName: 'surface', type: 'non-text' },
  { token: '--color-icon-secondary', fg: '#4E606F', bg: '#F1F4F7', bgName: 'body', type: 'non-text' },
  { token: '--color-icon-disabled', fg: '#A4B0BC', bg: '#FFFFFF', bgName: 'surface', type: 'non-text' },
  { token: '--color-icon-disabled', fg: '#A4B0BC', bg: '#F1F4F7', bgName: 'body', type: 'non-text' },

  // Bordes sobre fondos principales
  { token: '--color-border-emphasized', fg: '#CCD3DB', bg: '#FFFFFF', bgName: 'surface', type: 'non-text' },
  { token: '--color-border-emphasized', fg: '#CCD3DB', bg: '#F1F4F7', bgName: 'body', type: 'non-text' },

  // Dark mode: texto sobre fondos oscuros
  { token: '--color-text-primary', fg: '#DFE2E5', bg: '#1F1F22', bgName: 'surface', type: 'regular', mode: 'dark' },
  { token: '--color-text-secondary', fg: '#AAAFB5', bg: '#1F1F22', bgName: 'surface', type: 'regular', mode: 'dark' },
  { token: '--color-text-disabled', fg: '#6F747C', bg: '#1F1F22', bgName: 'surface', type: 'regular', mode: 'dark' },
  { token: '--color-text-disabled', fg: '#6F747C', bg: '#111112', bgName: 'body', type: 'regular', mode: 'dark' },
  { token: '--color-text-disabled', fg: '#6F747C', bg: '#28292C', bgName: 'popover', type: 'regular', mode: 'dark' },
  { token: '--color-text-accent', fg: '#3E9EFB', bg: '#1F1F22', bgName: 'surface', type: 'regular', mode: 'dark' },
  { token: '--color-icon-secondary', fg: '#AAAFB5', bg: '#1F1F22', bgName: 'surface', type: 'non-text', mode: 'dark' },
  { token: '--color-icon-disabled', fg: '#6F747C', bg: '#1F1F22', bgName: 'surface', type: 'non-text', mode: 'dark' },
  { token: '--color-border-emphasized', fg: '#494D53', bg: '#1F1F22', bgName: 'surface', type: 'non-text', mode: 'dark' },
  { token: '--color-border-emphasized', fg: '#494D53', bg: '#111112', bgName: 'body', type: 'non-text', mode: 'dark' },
  { token: '--color-border-emphasized', fg: '#494D53', bg: '#28292C', bgName: 'popover', type: 'non-text', mode: 'dark' },
];

// =============================================================================
// Propuestas de fix
// =============================================================================

const FIXES = {
  // Text secondary: #4E606F → #3A4A5A (oscurece ~12%)
  '--color-text-secondary': { light: '#3A4A5A', dark: '#B8BDC3' },
  // Text disabled: #A4B0BC → #8A96A4 (oscurece ~10%)
  '--color-text-disabled': { light: '#8A96A4', dark: '#7A7F87' },
  // Icon secondary: #4E606F → #3A4A5A
  '--color-icon-secondary': { light: '#3A4A5A', dark: '#B8BDC3' },
  // Icon disabled: #A4B0BC → #8A96A4
  '--color-icon-disabled': { light: '#8A96A4', dark: '#7A7F87' },
  // Border emphasized light: #CCD3DB → #B0B8C2
  '--color-border-emphasized': { light: '#B0B8C2', dark: '#5A5E66' },
};

// =============================================================================
// Auditoría
// =============================================================================

console.log('='.repeat(90));
console.log('AUDITORÍA DE CONTRASTE WCAG 2.1 AA — Casos de UI (issue #3654)');
console.log('='.repeat(90));
console.log();

let totalFailures = 0;
let totalWarnings = 0;

for (const pair of PAIRS) {
  const mode = pair.mode || 'light';
  const ratio = contrastRatio(pair.fg, pair.bg);
  const threshold = pair.type === 'regular' ? 4.5 : 3.0;
  const pass = ratio >= threshold;
  
  const s = pass ? '✅' : (ratio >= threshold * 0.85 ? '⚠️' : '❌');
  if (!pass) {
    if (ratio >= threshold * 0.85) totalWarnings++;
    else totalFailures++;
  }

  const fix = FIXES[pair.token];
  const fixRatio = fix ? contrastRatio(fix[mode], pair.bg) : null;
  const fixPass = fixRatio ? fixRatio >= threshold : null;

  console.log(`${s} ${pair.token} (${pair.fg})`);
  console.log(`   sobre ${pair.bgName} (${pair.bg}) [${mode}] = ${ratio.toFixed(2)}:1 (${pair.type}, necesita ${threshold}:1)`);
  
  if (!pass && fix) {
    console.log(`   → Fix: ${fix[mode]} → ${fixRatio.toFixed(2)}:1 ${fixPass ? '✅' : '❌'}`);
  }
  console.log();
}

// =============================================================================
// Resumen
// =============================================================================
console.log('='.repeat(90));
console.log('RESUMEN');
console.log('='.repeat(90));
console.log();
console.log(`❌ Failures (< ${thresholdText(3.0)}): ${totalFailures}`);
console.log(`⚠️  Warnings (pasa large-text pero no regular): ${totalWarnings}`);
console.log(`✅ Pass: ${PAIRS.length - totalFailures - totalWarnings}`);
console.log();
console.log('Propuesta de cambios en packages/core/src/theme/tokens.stylex.ts:');
console.log();
for (const [token, fix] of Object.entries(FIXES)) {
  console.log(`  ${token}:`);
  console.log(`    light: ${fix.light}`);
  console.log(`    dark:  ${fix.dark}`);
}

function thresholdText(t) {
  return `${t}:1`;
}
