// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file theming-target-shape.js
 * @description A theming target must sit on the element that PAINTS the thing
 * being themed.
 *
 * Canonical criteria: the Component Audit Rubric's §2 checks — T7 (the target
 * sits on the element that paints), T6 (a prop that selects between style
 * objects rides that element's `themeProps()`) and T27 (prefer inheritance over
 * child targets), which cite the wiki's Theming Infrastructure page behind
 * them. The rubric is the source of truth, not this comment; every check below
 * names the id it automates.
 *
 * A target is a paint seam — color, background,
 * border, font, radius, shadow. Layout (`display`, `position`, flex/grid,
 * `margin`, `padding`, `gap`, width/height, `transform`) is the component's
 * structural contract and is themed through declared vars (the derived-var and
 * container-padding pipelines), not through a raw class target. And if the
 * themed thing is an internally-composed Astryx component, the target belongs
 * on that instance — which takes `className`/`xstyle` — not on a host element
 * wrapped around it.
 *
 * Bad — the target lands on a box that only lays out:
 *   <div {...mergeProps(themeProps('selector-dropdown'), stylex.props(styles.dropdown))}>
 *   // styles.dropdown: maxHeight, overflowY, padding, boxSizing → nothing to paint
 *
 * Bad — the target lands on a wrapper, not on the component it wraps:
 *   <div inert {...mergeProps(themeProps('x-option-checkbox'), stylex.props(styles.box))}>
 *     <CheckboxInput … />
 *   </div>
 *
 * Good:
 *   <CheckboxInput … className={…} />   // the target rides the component
 *   <div {...mergeProps(themeProps('selector-option'), stylex.props(styles.item))}>
 *   // styles.item: backgroundColor, color, borderRadius → a real paint seam
 *
 * Scope and silence — the rule only speaks when it can see the whole picture:
 *   - host elements only. A target spread onto an Astryx component
 *     (`<Icon {...themeProps('selector-clear-icon')} />`) paints through the
 *     component's own styles, which are not in this file.
 *   - every style the element applies must resolve to a `stylex.create()`
 *     entry, locally or in the module it was imported from
 *     (`stylex-style-source.js`). One unresolvable style and the element is
 *     skipped: "unknown" is not "no paint".
 *   - an element that sets a CSS custom property is skipped — it feeds the
 *     derived-var pipeline, and what that var paints is not visible here.
 *   - a component's own root target, which T7 exempts: it is the component's
 *     address, not a seam someone chose to add.
 */

import {
  classifyProperties,
  createFileScanner,
  INHERITABLE_PROPERTIES,
  isHostElement,
  isIgnorableChild,
  jsxNameText,
  mentionsConsumerStyles,
} from './theming-target.js';

/**
 * Prop keys that name RUNTIME state — something that changes while the
 * component is on screen. A target that declares the generic `state` key
 * covers all of them, so they are not separately required.
 */
const RUNTIME_STATE_HINTS = new Set([
  'state',
  'selected',
  'checked',
  'disabled',
  'expanded',
  'collapsed',
  'open',
  'active',
  'highlighted',
  'pressed',
]);

/** Prop keys that name a state or variant a theme would want to key on. */
const STATE_PROP_HINTS = new Set([
  ...RUNTIME_STATE_HINTS,
  'variant',
  'size',
  'status',
  'level',
  'orientation',
]);

/**
 * `isSelected` → `selected`, `item.disabled` → `disabled`: the prop key a
 * conditional style's test corresponds to.
 */
function stateWordsInTest(node, out = new Set()) {
  if (node == null || typeof node.type !== 'string') {
    return out;
  }
  if (node.type === 'Identifier' || node.type === 'JSXIdentifier') {
    const bare = node.name.replace(/^(is|has|should)([A-Z])/, (_, __, c) =>
      c.toLowerCase(),
    );
    const word = bare.charAt(0).toLowerCase() + bare.slice(1);
    if (STATE_PROP_HINTS.has(word)) {
      out.add(word);
    }
    return out;
  }
  for (const key of Object.keys(node)) {
    if (key === 'parent') continue;
    const value = node[key];
    if (Array.isArray(value)) {
      for (const item of value) stateWordsInTest(item, out);
    } else if (value != null && typeof value.type === 'string') {
      stateWordsInTest(value, out);
    }
  }
  return out;
}

/** Elements that paint through presentation attributes, not CSS. */
const SVG_ELEMENTS = new Set([
  'svg',
  'path',
  'circle',
  'rect',
  'ellipse',
  'line',
  'polygon',
  'polyline',
  'g',
  'use',
]);

/**
 * The target names that are this file's OWN root, from its path:
 * `RadioList/RadioList.tsx` → `radio-list`. A root target cannot be moved
 * somewhere better — it is how the component is addressed at all — so a
 * layout-only root is a different (and weaker) finding than a layout-only
 * sub-element target.
 */
function rootTargetNames(filename) {
  const parts = filename.split(/[\\/]/);
  const base = (parts[parts.length - 1] ?? '').replace(/\.[jt]sx?$/, '');
  const dir = parts[parts.length - 2] ?? '';
  const names = new Set();
  for (const candidate of [base, dir]) {
    if (/^[A-Z]/.test(candidate)) {
      // Compared without hyphens: `ProgressBar.tsx` renders `progressbar`,
      // not `progress-bar`, and both spellings are in use.
      names.add(candidate.toLowerCase());
    }
  }
  return names;
}

/** `progress-bar` and `progressbar` are the same root name. */
function isRootTarget(rootNames, target) {
  return rootNames.has(target.replaceAll('-', ''));
}

/** Styles this element may receive from outside its own `stylex.props()`. */
function stylesComeFromOutside(opening) {
  return opening.attributes.some((attribute) => {
    if (attribute.type === 'JSXSpreadAttribute') {
      return attribute.argument?.type !== 'CallExpression';
    }
    const name = attribute.name?.name;
    return name === 'className' || name === 'style' || name === 'xstyle';
  });
}

const rule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'A themeProps() target must sit on an element that paints — not on a layout-only box or a wrapper around an Astryx component',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      // T7 — themeProps sits on the element that actually paints.
      layoutOnlyTarget:
        "T7: theme target '{{target}}' sits on an element whose styles declare no " +
        'paint property — only {{properties}}. A target is a paint seam ' +
        '(color, background, border, font, radius, shadow); layout is the ' +
        "component's structural contract and is themed through declared vars " +
        '(derived-var / container-padding), not a raw class target. Move the ' +
        'target to the element that paints, or drop it.',
      wrapperTarget:
        "T7: theme target '{{target}}' sits on a <{{wrapper}}> that only wraps " +
        '<{{component}}> and paints nothing itself. Attach the target to ' +
        '<{{component}}> through its className/xstyle passthrough — a wrapper ' +
        'minted to hold a target is not part of the contract, and a ' +
        'same-element rule in @layer astryx-theme reaches the paint a ' +
        'wrapper-level target cannot.',
      unstyledTarget:
        "T7: theme target '{{target}}' sits on an element with no styles of its " +
        'own, so there is nothing for a theme to override on it. Put the ' +
        'target on the element that carries the base styles.',
      // T27 — prefer inheritance over child targets.
      targetOnRenderPropFallback:
        "T27: theme target '{{fallbackTarget}}' is on a fallback that " +
        '{{callback}}() renders in place of, so the target silently misses ' +
        'every custom-rendered {{callback}} result. Put the inheritable ' +
        "declarations ({{properties}}) on '{{target}}' and let both paths " +
        'inherit them.',
      inheritableOnRenderPropFallback:
        'T7: this fallback element declares {{properties}}, which cascade, but ' +
        '{{callback}}() renders in its place and never gets them — the two ' +
        'render paths already diverge. It also has no target of its own, so a ' +
        "theme reaching '{{target}}' cannot restyle it. Hoist the inheritable " +
        "declarations to the '{{target}}' element: one seam then covers both " +
        'paths (T7 — every painted property reachable from a documented ' +
        'target; T27 — prefer inheritance over child targets).',
      // T6 — historically the most frequent theming finding, and the check
      // the rubric records as having no lint rule.
      underDeclaredState:
        "T6: theme target '{{target}}' is on an element whose styles vary with " +
        '{{missing}}, but themeProps() does not pass {{missing}}. A theme ' +
        'cannot express "{{example}}" without it — a prop that selects between ' +
        'style objects has to ride the target.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowTargets: {
            type: 'array',
            items: {type: 'string'},
            description:
              'Target names grandfathered in (exact `themeProps()` name).',
          },
          allowFiles: {
            type: 'array',
            items: {type: 'string'},
            description: 'Substring match on the filename.',
          },
          checkRenderPropFallback: {
            type: 'boolean',
            description:
              'Report inheritable typography/color on a fallback element ' +
              'that a render-prop callback replaces. Narrow by construction: ' +
              'the divergence between the two render paths is visible in the ' +
              'AST, so this does not depend on design intent.',
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const options = context.options[0] ?? {};
    const allowTargets = new Set(options.allowTargets ?? []);
    const allowFiles = options.allowFiles ?? [];
    const checkRenderPropFallback = options.checkRenderPropFallback !== false;
    const scanner = createFileScanner(context);
    if (allowFiles.some((pattern) => scanner.filename.includes(pattern))) {
      return {};
    }
    const rootNames = rootTargetNames(scanner.filename);

    const elements = [];

    function checkElement(node) {
      const opening = node.openingElement;
      // A target on an Astryx component paints through that component's own
      // styles, which this file cannot see.
      if (!isHostElement(opening.name)) {
        return;
      }
      const targets = scanner
        .themeTargets(opening)
        .filter((target) => target.name != null && !allowTargets.has(target.name));
      if (targets.length === 0) {
        return;
      }

      const {all, conditional, implicit} = scanner.styleArguments(opening);

      // Resolve every style the element applies. One unknown and the element
      // is out of scope — see the file header.
      const properties = [...implicit];
      for (const argument of all) {
        const resolved = scanner.resolveStyleProperties(argument);
        if (resolved == null) {
          return;
        }
        properties.push(...resolved);
      }
      const {paint, layout, neutral, hasVar} = classifyProperties(properties);
      if (hasVar) {
        return;
      }

      const data = (target) => ({target: target.name});

      if (paint.length === 0) {
        // Nothing here paints. Three shapes, three different fixes: the target
        // belongs on the component this element wraps, the element carries no
        // styles at all, or it carries only layout.
        const child = soleAstryxChild(node);
        for (const target of targets) {
          if (child != null) {
            context.report({
              node: target.node,
              messageId: 'wrapperTarget',
              data: {
                target: target.name,
                wrapper: opening.name.name,
                component: jsxNameText(child.openingElement.name),
              },
            });
            continue;
          }
          if (properties.length === 0) {
            // Silent when something else could be bringing styles in (a
            // `className`/`xstyle` prop, a `{...rest}` spread of a props
            // object), and on SVG, which paints via presentation attributes.
            if (
              stylesComeFromOutside(opening) ||
              all.some(mentionsConsumerStyles) ||
              SVG_ELEMENTS.has(opening.name.name)
            ) {
              continue;
            }
            context.report({
              node: target.node,
              messageId: 'unstyledTarget',
              data: data(target),
            });
            continue;
          }
          // A component's own root target is its address rather than a seam
          // anyone chose to add, and there is nowhere else to put it: 55 layout
          // primitives (Stack, Grid, Divider) have a layout-only root. T7
          // governs sub-element targets.
          if (isRootTarget(rootNames, target.name)) {
            continue;
          }
          context.report({
            node: target.node,
            messageId: 'layoutOnlyTarget',
            data: {
              target: target.name,
              properties: [...new Set([...layout, ...neutral])]
                .slice(0, 6)
                .join(', '),
            },
          });
        }
        return;
      }

      // --- T6: a prop that selects between style objects rides the target --

      /** State words the element's conditional styles actually switch on. */
      const conditionalWords = new Set();
      for (const argument of conditional) {
        const test =
          argument.type === 'LogicalExpression'
            ? argument.left
            : argument.type === 'ConditionalExpression'
              ? argument.test
              : // `sizeStyles[size]` — the key expression names the state.
                argument.property;
        const words = stateWordsInTest(test);
        for (const word of words) {
          conditionalWords.add(word);
        }
      }

      for (const target of targets) {
        if (target.isOpaque) {
          continue;
        }
        const declared = new Set(target.propKeys);

        // An undeclared state is the more actionable finding: the target is
        // missing a seam entirely, rather than exposing a weak one. A target
        // that declares the generic `state` key (`state: 'expanded'`) covers
        // every runtime state word — that IS how the state is spelled here.
        const coversRuntimeState = declared.has('state');
        const missing = [...conditionalWords].filter(
          (word) =>
            !declared.has(word) &&
            !(coversRuntimeState && RUNTIME_STATE_HINTS.has(word)),
        );
        if (missing.length > 0) {
          context.report({
            node: target.node,
            messageId: 'underDeclaredState',
            data: {
              target: target.name,
              missing: missing.join(', '),
              example: missing.map((word) => `${word} option`).join(' / '),
            },
          });
          continue;
        }

      }
    }

    return {
      ImportDeclaration: scanner.importDeclaration,
      VariableDeclarator: scanner.variableDeclarator,
      JSXElement(node) {
        elements.push(node);
      },
      'Program:exit'() {
        for (const node of elements) {
          checkElement(node);
        }
        if (checkRenderPropFallback) {
          for (const node of elements) {
            checkRenderPropFallbacks(node);
          }
        }
      },
    };

    /**
     * The narrow, intent-independent case: `renderThing ? renderThing(x) :
     * <span {...stylex.props(styles.label)}>`. The fallback's typography
     * applies to exactly one of the two render paths, which is a divergence
     * the AST shows directly — no guess about design intent required.
     */
    function checkRenderPropFallbacks(node) {
      const targets = scanner
        .themeTargets(node.openingElement)
        .filter((target) => target.name != null && !allowTargets.has(target.name));
      if (targets.length === 0) {
        return;
      }
      const targetName = targets[0].name;

      for (const {fallback, callback} of renderPropBranches(node)) {
        if (!isHostElement(fallback.openingElement.name)) {
          continue;
        }
        // A target ON the fallback is not an exemption — it is T27's named
        // anti-pattern, because the callback's output never carries it.
        const fallbackTargets = scanner
          .themeTargets(fallback.openingElement)
          .filter((target) => target.name != null);
        const {all} = scanner.styleArguments(fallback.openingElement);
        const properties = [];
        let ok = true;
        for (const argument of all) {
          const names = scanner.resolveStyleProperties(argument);
          if (names == null) {
            ok = false;
            break;
          }
          properties.push(...names);
        }
        if (!ok) continue;
        const inheritable = [
          ...new Set(properties.filter((name) => INHERITABLE_PROPERTIES.has(name))),
        ];
        if (inheritable.length === 0) continue;
        if (fallbackTargets.length > 0) {
          for (const fallbackTarget of fallbackTargets) {
            if (allowTargets.has(fallbackTarget.name)) continue;
            context.report({
              node: fallback.openingElement,
              messageId: 'targetOnRenderPropFallback',
              data: {
                target: targetName,
                fallbackTarget: fallbackTarget.name,
                callback,
                properties: inheritable.slice(0, 6).join(', '),
              },
            });
          }
          continue;
        }
        context.report({
          node: fallback.openingElement,
          messageId: 'inheritableOnRenderPropFallback',
          data: {
            target: targetName,
            callback,
            properties: inheritable.slice(0, 6).join(', '),
          },
        });
      }
    }

    /**
     * `cb ? cb(x) : <el/>` and `cb ? <el/> : cb(x)` inside a subtree: the
     * styled fallback element and the callback that replaces it.
     */
    function renderPropBranches(root) {
      const found = [];
      const seen = new Set();
      const visit = (current) => {
        if (current == null || typeof current.type !== 'string') return;
        if (seen.has(current)) return;
        seen.add(current);
        if (current.type === 'ConditionalExpression') {
          for (const [a, b] of [
            [current.consequent, current.alternate],
            [current.alternate, current.consequent],
          ]) {
            const callback = renderCallbackName(a);
            if (callback != null && b?.type === 'JSXElement') {
              found.push({fallback: b, callback});
            }
          }
        }
        for (const key of Object.keys(current)) {
          if (key === 'parent') continue;
          const value = current[key];
          if (Array.isArray(value)) value.forEach(visit);
          else visit(value);
        }
      };
      visit(root);
      return found;
    }

    /** `renderOption(item)` → 'renderOption'; anything else → null. */
    function renderCallbackName(node) {
      if (
        node?.type === 'CallExpression' &&
        node.callee?.type === 'Identifier' &&
        /^render[A-Z]/.test(node.callee.name)
      ) {
        return node.callee.name;
      }
      return null;
    }

    /** JSX elements nested inside an expression container. */
    function collectElements(root) {
      const found = [];
      const walkExpression = (current) => {
        if (current == null || typeof current.type !== 'string') return;
        if (current.type === 'JSXElement') {
          found.push(current);
          return; // inspect() recurses into it
        }
        for (const key of Object.keys(current)) {
          if (key === 'parent') continue;
          const value = current[key];
          if (Array.isArray(value)) value.forEach(walkExpression);
          else walkExpression(value);
        }
      };
      walkExpression(root);
      return found;
    }

    /** The one Astryx component this element wraps, if that is all it holds. */
    function soleAstryxChild(node) {
      const children = node.children.filter((child) => !isIgnorableChild(child));
      if (children.length !== 1) {
        return null;
      }
      const child = children[0];
      if (child.type !== 'JSXElement') {
        return null;
      }
      return scanner.isAstryxComponent(child.openingElement.name) ? child : null;
    }
  },
};

export default rule;
