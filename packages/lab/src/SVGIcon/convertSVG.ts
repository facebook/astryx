/**
 * @file convertSVG.ts
 * @input Raw SVG markup string
 * @output Parsed SVGIconDef with layers classified and attributes rewired
 * @position Utility for the SVG upload & convert story
 *
 * Parses arbitrary SVG markup, extracts shape elements, classifies them into
 * primary/secondary layers, strips hardcoded styling attributes, and produces
 * an SVGIconDef ready for the XDSSVGIcon system.
 */

import type {SVGIconDef, IconShape} from './XDSSVGIcon';

const SHAPE_TAGS = [
  'path',
  'circle',
  'rect',
  'line',
  'polyline',
  'polygon',
] as const;
const _STRIP_ATTRS = [
  'fill',
  'stroke',
  'stroke-width',
  'stroke-linecap',
  'stroke-linejoin',
  'style',
  'color',
];

/** Attributes to preserve per shape type */
const KEEP_ATTRS: Record<string, string[]> = {
  path: ['d', 'fill-rule', 'clip-rule'],
  circle: ['cx', 'cy', 'r'],
  rect: ['x', 'y', 'width', 'height', 'rx', 'ry'],
  line: ['x1', 'y1', 'x2', 'y2'],
  polyline: ['points'],
  polygon: ['points'],
};

/**
 * Estimate visual "weight" of a shape for layer classification.
 * Larger/more complex shapes → primary, smaller → secondary.
 */
function shapeWeight(shape: IconShape): number {
  const {type, attrs} = shape;
  switch (type) {
    case 'path': {
      // Approximate by path data length (more commands = bigger shape)
      return (attrs.d ?? '').length;
    }
    case 'circle':
      return parseFloat(attrs.r ?? '0') * 2;
    case 'rect':
      return parseFloat(attrs.width ?? '0') * parseFloat(attrs.height ?? '0');
    case 'line':
      return 10; // lines are typically detail
    case 'polyline':
    case 'polygon':
      return (attrs.points ?? '').length;
    default:
      return 0;
  }
}

/**
 * Parse raw SVG markup into an SVGIconDef.
 *
 * Uses DOMParser to extract shapes, strips hardcoded styling,
 * and classifies shapes into primary (≥ median weight) and secondary layers.
 */
export function convertSVG(
  svgMarkup: string,
  name: string = 'Converted',
): SVGIconDef {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgMarkup, 'image/svg+xml');
  const svg = doc.querySelector('svg');

  const viewBox = svg?.getAttribute('viewBox') ?? '0 0 24 24';

  // Extract all shape elements
  const shapes: IconShape[] = [];
  for (const tag of SHAPE_TAGS) {
    const elements = doc.querySelectorAll(tag);
    elements.forEach(el => {
      const keepList = KEEP_ATTRS[tag] ?? [];
      const attrs: Record<string, string> = {};

      for (const attrName of keepList) {
        const val = el.getAttribute(attrName);
        if (val != null) {
          attrs[attrName] = val;
        }
      }

      // Only include shapes that have meaningful geometry
      if (Object.keys(attrs).length > 0) {
        shapes.push({type: tag as IconShape['type'], attrs});
      }
    });
  }

  // Classify into layers: shapes above median weight → primary
  if (shapes.length <= 2) {
    return {
      name,
      viewBox,
      primary: shapes,
    };
  }

  const weights = shapes.map(s => ({shape: s, weight: shapeWeight(s)}));
  weights.sort((a, b) => b.weight - a.weight);

  const median = weights[Math.floor(weights.length / 2)].weight;
  const primary: IconShape[] = [];
  const secondary: IconShape[] = [];

  for (const {shape, weight} of weights) {
    if (weight >= median) {
      primary.push(shape);
    } else {
      secondary.push(shape);
    }
  }

  return {
    name,
    viewBox,
    primary,
    secondary: secondary.length > 0 ? secondary : undefined,
  };
}

/**
 * Generate a TSX component string from an SVGIconDef.
 */
export function iconDefToTSX(def: SVGIconDef): string {
  const varName = def.name.replace(/[^a-zA-Z0-9]/g, '');
  const lines = [
    `import type {SVGIconDef} from '@xds/lab';`,
    ``,
    `export const ${varName[0].toLowerCase() + varName.slice(1)}Icon: SVGIconDef = ${JSON.stringify(def, null, 2)};`,
  ];
  return lines.join('\n');
}

/**
 * Generate a raw SVG string with CSS variable references from an SVGIconDef.
 */
export function iconDefToSVG(def: SVGIconDef): string {
  const viewBox = def.viewBox ?? '0 0 24 24';

  function shapesToSVG(
    shapes: IconShape[],
    _layer: 'primary' | 'secondary',
  ): string {
    return shapes
      .map(shape => {
        const attrs = Object.entries(shape.attrs)
          .map(([k, v]) => `${k}="${v}"`)
          .join(' ');
        const selfClosing = [
          'path',
          'circle',
          'rect',
          'line',
          'polyline',
          'polygon',
        ].includes(shape.type);
        return `    <${shape.type} ${attrs}${selfClosing ? ' /' : ''}>`;
      })
      .join('\n');
  }

  const primaryGroup = `  <g fill="var(--icon-layer-primary-fill)" stroke="var(--icon-layer-primary-stroke)" opacity="var(--icon-layer-primary-opacity)" stroke-width="var(--icon-stroke-width)" stroke-linecap="var(--icon-stroke-linecap)" stroke-linejoin="var(--icon-stroke-linejoin)">\n${shapesToSVG(def.primary, 'primary')}\n  </g>`;

  const secondaryGroup =
    def.secondary && def.secondary.length > 0
      ? `\n  <g fill="var(--icon-layer-secondary-fill)" stroke="var(--icon-layer-secondary-stroke)" opacity="var(--icon-layer-secondary-opacity)" stroke-width="var(--icon-stroke-width)" stroke-linecap="var(--icon-stroke-linecap)" stroke-linejoin="var(--icon-stroke-linejoin)">\n${shapesToSVG(def.secondary, 'secondary')}\n  </g>`
      : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">\n${primaryGroup}${secondaryGroup}\n</svg>`;
}
