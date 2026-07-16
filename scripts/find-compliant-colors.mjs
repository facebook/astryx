#!/usr/bin/env node
/**
 * Calcula el valor exacto de color necesario para cumplir WCAG AA.
 *
 * Para un foreground dado y un background, encuentra el color más cercano
 * (en el espacio sRGB) que cumple el ratio objetivo.
 */

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  if (hex.length === 8) hex = hex.slice(0, 6);
  return { r: parseInt(hex.slice(0, 2), 16), g: parseInt(hex.slice(2, 4), 16), b: parseInt(hex.slice(4, 6), 16) };
}

function rgbToHex(r, g, b) {
  const toHex = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
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

/**
 * Encuentra el color más cercano a originalFg que da al menos targetRatio contra bg.
 * Escala el color hacia más oscuro (si bg es claro) o más claro (si bg es oscuro).
 */
function findCompliantColor(originalFg, bg, targetRatio) {
  const lbg = relativeLuminance(bg);
  const lfg = relativeLuminance(originalFg);
  const { r, g, b } = hexToRgb(originalFg);
  
  // Determinar dirección
  const fgIsLighter = lfg > lbg;
  
  // Si el fg ya es más claro que el bg, necesitamos hacerlo aún más claro
  // Si el fg ya es más oscuro, necesitamos hacerlo aún más oscuro
  // (asumiendo que el fg está en el lado correcto del bg)
  
  let best = null;
  let bestRatio = 0;
  
  // Escalar el color manteniendo el tono (hue)
  // Escalamos desde el color original hacia blanco (más claro) o negro (más oscuro)
  for (let t = 0; t <= 1; t += 0.001) {
    let nr, ng, nb;
    if (fgIsLighter) {
      // Hacer más claro: mezclar con blanco
      nr = r + (255 - r) * t;
      ng = g + (255 - g) * t;
      nb = b + (255 - b) * t;
    } else {
      // Hacer más oscuro: mezclar con negro
      nr = r * (1 - t);
      ng = g * (1 - t);
      nb = b * (1 - t);
    }
    
    const hex = rgbToHex(nr, ng, nb);
    const ratio = contrastRatio(hex, bg);
    
    if (ratio >= targetRatio) {
      return { hex, ratio, t };
    }
    
    if (ratio > bestRatio) {
      bestRatio = ratio;
      best = { hex, ratio, t };
    }
  }
  
  return best;
}

// =============================================================================
// Casos a resolver
// =============================================================================

const CASES = [
  // Light mode
  { token: '--color-text-disabled', fg: '#A4B0BC', bg: '#FFFFFF', bgName: 'surface', target: 4.5 },
  { token: '--color-text-disabled', fg: '#A4B0BC', bg: '#F1F4F7', bgName: 'body', target: 4.5 },
  { token: '--color-icon-disabled', fg: '#A4B0BC', bg: '#FFFFFF', bgName: 'surface', target: 3.0 },
  { token: '--color-icon-disabled', fg: '#A4B0BC', bg: '#F1F4F7', bgName: 'body', target: 3.0 },
  { token: '--color-border-emphasized', fg: '#CCD3DB', bg: '#FFFFFF', bgName: 'surface', target: 3.0 },
  { token: '--color-border-emphasized', fg: '#CCD3DB', bg: '#F1F4F7', bgName: 'body', target: 3.0 },
  
  // Dark mode
  { token: '--color-text-disabled', fg: '#6F747C', bg: '#1F1F22', bgName: 'surface', target: 4.5 },
  { token: '--color-text-disabled', fg: '#6F747C', bg: '#111112', bgName: 'body', target: 4.5 },
  { token: '--color-text-disabled', fg: '#6F747C', bg: '#28292C', bgName: 'popover', target: 4.5 },
  { token: '--color-border-emphasized', fg: '#494D53', bg: '#1F1F22', bgName: 'surface', target: 3.0 },
  { token: '--color-border-emphasized', fg: '#494D53', bg: '#111112', bgName: 'body', target: 3.0 },
  { token: '--color-border-emphasized', fg: '#494D53', bg: '#28292C', bgName: 'popover', target: 3.0 },
];

console.log('CÁLCULO DE COLORES WCAG AA COMPLIANT');
console.log('='.repeat(80));
console.log();

for (const c of CASES) {
  const current = contrastRatio(c.fg, c.bg);
  const result = findCompliantColor(c.fg, c.bg, c.target);
  
  console.log(`${c.token} sobre ${c.bgName} (${c.bg})`);
  console.log(`  Actual: ${c.fg} → ${current.toFixed(2)}:1 (necesita ${c.target}:1)`);
  if (result) {
    console.log(`  Fix:    ${result.hex} → ${result.ratio.toFixed(2)}:1 ✅ (t=${result.t.toFixed(3)})`);
  } else {
    console.log(`  ❌ No se encontró fix`);
  }
  console.log();
}

// =============================================================================
// Mejor estimación para cada token (el peor caso)
// =============================================================================
console.log('='.repeat(80));
console.log('MEJOR ESTIMACIÓN POR TOKEN (cubre el peor caso)');
console.log('='.repeat(80));
console.log();

// Para text-disabled light: el peor caso es body (#F1F4F7) con target 4.5
const tdl = findCompliantColor('#A4B0BC', '#F1F4F7', 4.5);
console.log(`--color-text-disabled light: ${tdl ? tdl.hex : 'N/A'} (${tdl ? tdl.ratio.toFixed(2) : 'N/A'}:1 contra body)`);

// Para text-disabled dark: el peor caso es popover (#28292C) con target 4.5
const tdd = findCompliantColor('#6F747C', '#28292C', 4.5);
console.log(`--color-text-disabled dark:  ${tdd ? tdd.hex : 'N/A'} (${tdd ? tdd.ratio.toFixed(2) : 'N/A'}:1 contra popover)`);

// Para border-emphasized light: el peor caso es body (#F1F4F7) con target 3.0
const bel = findCompliantColor('#CCD3DB', '#F1F4F7', 3.0);
console.log(`--color-border-emphasized light: ${bel ? bel.hex : 'N/A'} (${bel ? bel.ratio.toFixed(2) : 'N/A'}:1 contra body)`);

// Para border-emphasized dark: el peor caso es popover (#28292C) con target 3.0
const bed = findCompliantColor('#494D53', '#28292C', 3.0);
console.log(`--color-border-emphasized dark:  ${bed ? bed.hex : 'N/A'} (${bed ? bed.ratio.toFixed(2) : 'N/A'}:1 contra popover)`);
