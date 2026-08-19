// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Splits compiled StyleX CSS into the Astryx library layer and the product
 * layer.
 *
 * StyleX compiles every file in one pass and emits its atoms into flat
 * `@layer priorityN` blocks. Those blocks are declared after the named layers,
 * so library base styles end up outranking the installed theme. Astryx gives
 * library atoms their own class-name prefix, which is what lets the two be
 * told apart again here and re-nested:
 *
 *   @layer astryx-base { @layer priority1, ...; @layer priority1 { ... } }
 *   @layer product     { @layer priority1, ...; @layer priority1 { ... } }
 *
 * Splitting the emitted CSS — rather than compiling twice — keeps whatever
 * post-processing (lightningcss lowering, minification) the bundler already
 * applied, and is idempotent: only top-level priority layers are rewritten.
 */

import postcss, {AtRule, Container, Root, Rule, type ChildNode} from 'postcss';

/** postcss types `nodes` as optional on at-rules; statement at-rules have none. */
function count(node: AtRule): number {
  return node.nodes?.length ?? 0;
}

const PRIORITY_LAYER = /^priority\d+$/;
const CLASS_TOKEN = /\.(-?[_a-zA-Z][\w-]*)/g;
const PRODUCT_ATOM = /^x[0-9a-z]+$/;

type Bucket = 'library' | 'product';

/**
 * Which layer a selector belongs to, judged by the atomic class prefix.
 * Selectors carrying no atom at all (`:root` token blocks, element resets)
 * count as library: they are Astryx defaults that the theme must be able to
 * override.
 */
function bucketForSelector(selector: string, libraryPrefix: string): Bucket {
  let product = false;
  for (const [, name] of selector.matchAll(CLASS_TOKEN)) {
    if (name.startsWith(libraryPrefix)) return 'library';
    if (PRODUCT_ATOM.test(name)) product = true;
  }
  return product ? 'product' : 'library';
}

function bucketForAtRule(node: AtRule, libraryPrefix: string): Bucket | null {
  if (node.name === 'keyframes' || node.name.endsWith('-keyframes')) {
    return node.params.trim().startsWith(libraryPrefix) ? 'library' : 'product';
  }
  return null;
}

/**
 * Partition a container's children into the two buckets, recursing through
 * conditional at-rules (`@media`, `@supports`, `@container`, `@scope`) so a
 * rule inside one is still judged on its own selector.
 */
function partition(
  source: Container,
  targets: Record<Bucket, Container>,
  libraryPrefix: string,
): void {
  source.each((node: ChildNode) => {
    if (node.type === 'rule') {
      const rule = node as Rule;
      const selectors: Record<Bucket, string[]> = {library: [], product: []};
      for (const selector of rule.selectors) {
        selectors[bucketForSelector(selector, libraryPrefix)].push(selector);
      }
      for (const bucket of ['library', 'product'] as const) {
        if (selectors[bucket].length === 0) continue;
        const clone = rule.clone();
        clone.selectors = selectors[bucket];
        targets[bucket].append(clone);
      }
      return;
    }

    if (node.type === 'atrule') {
      const atRule = node as AtRule;
      const fixed = bucketForAtRule(atRule, libraryPrefix);
      if (fixed != null) {
        targets[fixed].append(atRule.clone());
        return;
      }
      if (atRule.nodes == null) {
        // Statement at-rules (`@layer a, b;`) carry ordering, not styles.
        targets.library.append(atRule.clone());
        targets.product.append(atRule.clone());
        return;
      }
      const nested: Record<Bucket, AtRule> = {
        library: atRule.clone({nodes: []}),
        product: atRule.clone({nodes: []}),
      };
      partition(atRule, nested, libraryPrefix);
      for (const bucket of ['library', 'product'] as const) {
        if (count(nested[bucket]) > 0) targets[bucket].append(nested[bucket]);
      }
      return;
    }

    // Anything else (a stray declaration or comment) rides with the library.
    targets.library.append(node.clone());
  });
}

export interface SplitStylexLayersOptions {
  /** Layer that receives Astryx library atoms. */
  libraryLayer: string;
  /** Layer that receives product atoms. */
  productLayer: string;
  /** Class-name prefix given to library atoms. */
  libraryPrefix: string;
}

/**
 * Rewrite top-level StyleX priority layers into the library and product
 * layers. Returns the input unchanged when there is nothing to split.
 */
export function splitStylexLayers(
  css: string,
  {libraryLayer, productLayer, libraryPrefix}: SplitStylexLayersOptions,
): string {
  if (!css.includes('@layer priority')) return css;
  // A library prefix that is itself a valid product atom would make every
  // selector ambiguous; leave the CSS alone rather than mis-sort it.
  if (PRODUCT_ATOM.test(libraryPrefix)) return css;

  let root: Root;
  try {
    root = postcss.parse(css);
  } catch {
    return css;
  }

  const priorityLayers: AtRule[] = [];
  root.each(node => {
    if (
      node.type === 'atrule' &&
      node.name === 'layer' &&
      PRIORITY_LAYER.test(node.params.trim())
    ) {
      priorityLayers.push(node);
    }
  });
  if (priorityLayers.length === 0) return css;

  const wrappers: Record<Bucket, AtRule> = {
    library: postcss.atRule({name: 'layer', params: libraryLayer, nodes: []}),
    product: postcss.atRule({name: 'layer', params: productLayer, nodes: []}),
  };

  // Re-declare the priority order inside each wrapper: a layer that ends up
  // with rules in only one bucket must still sort against its siblings.
  const order = priorityLayers.map(layer => layer.params.trim()).join(', ');
  for (const bucket of ['library', 'product'] as const) {
    wrappers[bucket].append(
      postcss.atRule({name: 'layer', params: order, raws: {afterName: ' '}}),
    );
  }

  for (const layer of priorityLayers) {
    if (layer.nodes == null || layer.nodes.length === 0) continue;
    const nested: Record<Bucket, AtRule> = {
      library: layer.clone({nodes: []}),
      product: layer.clone({nodes: []}),
    };
    partition(layer, nested, libraryPrefix);
    for (const bucket of ['library', 'product'] as const) {
      if (count(nested[bucket]) > 0) wrappers[bucket].append(nested[bucket]);
    }
  }

  priorityLayers[0].replaceWith(
    ...(['library', 'product'] as const)
      // > 1: every wrapper holds the priority-order statement, rules or not.
      .filter(bucket => count(wrappers[bucket]) > 1)
      .map(bucket => wrappers[bucket]),
  );
  for (const layer of priorityLayers.slice(1)) layer.remove();

  return root.toString();
}
