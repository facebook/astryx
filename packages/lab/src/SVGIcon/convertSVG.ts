/**
 * @file convertSVG.ts
 * @input Raw SVG markup string
 * @output Parsed SVGIconDef with layers classified, roles assigned, and attributes rewired
 * @position Utility for the SVG upload & convert story
 *
 * Parses arbitrary SVG markup, extracts shape elements, classifies them into
 * primary/secondary layers, assigns fill/stroke roles based on shape type
 * and geometry, strips hardcoded styling attributes, and produces an SVGIconDef.
 */

import type {SVGIconDef, IconShape, IconShapeRole} from './XDSSVGIcon';

const SHAPE_TAGS = [
  'path',
  'circle',
  'rect',
  'line',
  'polyline',
  'polygon',
] as const;

/** Attributes to preserve per shape type */
const KEEP_ATTRS: Record<string, string[]> = {
  path: ['d', 'fill-rule', 'clip-rule'],
  circle: ['cx', 'cy', 'r'],
  rect: ['x', 'y', 'width', 'height', 'rx', 'ry'],
  line: ['x1', 'y1', 'x2', 'y2'],
  polyline: ['points'],
  polygon: ['points'],
};

/** Infer role from element type and attributes */
function inferRole(
  type: string,
  _attrs: Record<string, string>,
): IconShapeRole {
  // Lines and polylines are inherently stroke-only
  if (type === 'line' || type === 'polyline') return 'stroke';
  // Open paths (no Z/z close command) are stroke-role
  if (type === 'path') {
    const d = _attrs.d ?? '';
    if (!d.match(/[zZ]\s*$/)) return 'stroke';
  }
  return 'fill';
}

/** Estimate visual "weight" for layer classification */
function shapeWeight(shape: IconShape): number {
  const {type, attrs} = shape;
  switch (type) {
    case 'path':
      return (attrs.d ?? '').length;
    case 'circle':
      return parseFloat(attrs.r ?? '0') * 2;
    case 'rect':
      return parseFloat(attrs.width ?? '0') * parseFloat(attrs.height ?? '0');
    case 'line':
      return 10;
    case 'polyline':
    case 'polygon':
      return (attrs.points ?? '').length;
    default:
      return 0;
  }
}

/**
 * Parse raw SVG markup into an SVGIconDef with roles.
 */
export function convertSVG(
  svgMarkup: string,
  name: string = 'Converted',
): SVGIconDef {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgMarkup, 'image/svg+xml');
  const svg = doc.querySelector('svg');

  const viewBox = svg?.getAttribute('viewBox') ?? '0 0 24 24';

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

      if (Object.keys(attrs).length > 0) {
        shapes.push({
          type: tag as IconShape['type'],
          attrs,
          role: inferRole(tag, attrs),
        });
      }
    });
  }

  if (shapes.length <= 2) {
    return {name, viewBox, primary: shapes};
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

/** Generate a TSX component string from an SVGIconDef. */
export function iconDefToTSX(def: SVGIconDef): string {
  const varName = def.name.replace(/[^a-zA-Z0-9]/g, '');
  const lines = [
    `import type {SVGIconDef} from '@xds/lab';`,
    ``,
    `export const ${varName[0].toLowerCase() + varName.slice(1)}Icon: SVGIconDef = ${JSON.stringify(def, null, 2)};`,
  ];
  return lines.join('\n');
}

/** Generate a raw SVG string with CSS variable references from an SVGIconDef. */
export function iconDefToSVG(def: SVGIconDef): string {
  const viewBox = def.viewBox ?? '0 0 24 24';

  function shapesToSVG(shapes: IconShape[]): string {
    return shapes
      .map(shape => {
        const attrs = Object.entries(shape.attrs)
          .map(([k, v]) => `${k}="${v}"`)
          .join(' ');
        return `    <${shape.type} ${attrs} />`;
      })
      .join('\n');
  }

  const primaryFill = def.primary.filter(s => s.role !== 'stroke');
  const primaryStroke = def.primary.filter(s => s.role === 'stroke');
  const secondaryFill = (def.secondary ?? []).filter(s => s.role !== 'stroke');
  const secondaryStroke = (def.secondary ?? []).filter(
    s => s.role === 'stroke',
  );

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">\n`;

  if (primaryFill.length > 0) {
    svg += `  <g fill="var(--icon-layer-primary-fill)" stroke="var(--icon-layer-primary-stroke)" opacity="var(--icon-layer-primary-opacity)" stroke-width="var(--icon-stroke-width)" stroke-linecap="var(--icon-stroke-linecap)" stroke-linejoin="var(--icon-stroke-linejoin)">\n${shapesToSVG(primaryFill)}\n  </g>\n`;
  }
  if (primaryStroke.length > 0) {
    svg += `  <g fill="none" stroke="var(--icon-layer-primary-stroke-role-stroke)" opacity="var(--icon-layer-primary-stroke-role-opacity)" stroke-width="var(--icon-layer-primary-stroke-role-width)" stroke-linecap="var(--icon-stroke-linecap)" stroke-linejoin="var(--icon-stroke-linejoin)">\n${shapesToSVG(primaryStroke)}\n  </g>\n`;
  }
  if (secondaryFill.length > 0) {
    svg += `  <g fill="var(--icon-layer-secondary-fill)" stroke="var(--icon-layer-secondary-stroke)" opacity="var(--icon-layer-secondary-opacity)" stroke-width="var(--icon-stroke-width)" stroke-linecap="var(--icon-stroke-linecap)" stroke-linejoin="var(--icon-stroke-linejoin)">\n${shapesToSVG(secondaryFill)}\n  </g>\n`;
  }
  if (secondaryStroke.length > 0) {
    svg += `  <g fill="none" stroke="var(--icon-layer-secondary-stroke-role-stroke)" opacity="var(--icon-layer-secondary-stroke-role-opacity)" stroke-width="var(--icon-layer-secondary-stroke-role-width)" stroke-linecap="var(--icon-stroke-linecap)" stroke-linejoin="var(--icon-stroke-linejoin)">\n${shapesToSVG(secondaryStroke)}\n  </g>\n`;
  }

  svg += `</svg>`;
  return svg;
}
