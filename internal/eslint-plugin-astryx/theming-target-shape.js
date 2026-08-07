// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file theming-target-shape.js
 * @description A theming target must sit on the element that PAINTS the thing
 * being themed.
 *
 * Canonical criteria: "Principles for authoring theming targets" in the wiki's
 * Theming Infrastructure page — https://github.com/facebook/astryx/wiki/Theming-Infrastructure
 * This rule encodes principle 1 (and, behind `checkStateSurface`, principle 2);
 * the wiki is the source of truth, not this comment.
 *
 * From the wiki's "Principles for authoring theming targets" (principle 1) and
 * the paint-not-layout rule: a target is a paint seam — color, background,
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
 *
 * Two opt-in checks (`checkStateSurface`) go after principle 2 rather than
 * principle 1 — see the option docs below. They are off by default because the
 * signal is weaker; measure before turning one on.
 */

import {
  classifyProperties,
  createFileScanner,
  isHostElement,
  isIgnorableChild,
  jsxNameText,
  mentionsConsumerStyles,
} from './theming-target.js';

/**
 * Prop keys that name RUNTIME state — something that changes while the
 * component is on screen. Only these are held to "a state seam should paint":
 * `size` and `variant` must be reflected on the target whatever they change
 * (principle 2 is explicit that an option which can be sized must carry
 * `size`), so a size table that only moves padding is not a finding.
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
      layoutOnlyTarget:
        "Theme target '{{target}}' sits on an element whose styles declare no " +
        'paint property — only {{properties}}. A target is a paint seam ' +
        '(color, background, border, font, radius, shadow); layout is the ' +
        "component's structural contract and is themed through declared vars " +
        '(derived-var / container-padding), not a raw class target. Move the ' +
        'target to the element that paints, or drop it.',
      layoutOnlyRootTarget:
        "Theme target '{{target}}' is this component's root target, and the " +
        'root declares no paint property — only {{properties}}. The name has ' +
        'to stay, but the seam is layout-only: a theme can move this box, not ' +
        'restyle it. Check whether the element that actually paints (the ' +
        'field/surface it renders into) is the one that should carry the ' +
        'target.',
      wrapperTarget:
        "Theme target '{{target}}' sits on a <{{wrapper}}> that only wraps " +
        '<{{component}}> and paints nothing itself. Attach the target to ' +
        '<{{component}}> through its className/xstyle passthrough and name it ' +
        '{parent}-{position}-{component} — a wrapper minted to hold a target ' +
        'is not part of the contract.',
      unstyledTarget:
        "Theme target '{{target}}' sits on an element with no styles of its " +
        'own, so there is nothing for a theme to override on it. Put the ' +
        'target on the element that carries the base styles.',
      stateVariesOnlyLayout:
        "Theme target '{{target}}' declares state ({{props}}), but the styles " +
        'that state selects change only {{properties}} — layout, not paint. A ' +
        'state seam whose only effect is structural belongs in a declared var, ' +
        'not a class target.',
      underDeclaredState:
        "Theme target '{{target}}' is on an element whose styles vary with " +
        '{{missing}}, but themeProps() does not pass {{missing}}. A theme ' +
        'cannot express "{{example}}" without it (principle 2: state and size ' +
        'are data on the target).',
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
          checkRootTargets: {
            type: 'boolean',
            description:
              "Also report a component's OWN root target when the root " +
              'declares no paint. Off by default: 54 of the roots in ' +
              'packages/ are layout primitives (Stack, Grid, Divider, ' +
              'Breadcrumbs) whose root legitimately only lays out, and the ' +
              'target cannot be moved anywhere in any case.',
          },
          checkStateSurface: {
            type: 'boolean',
            description:
              'Also report state seams that only move layout, and elements ' +
              'whose conditional styles are not reflected in themeProps(). ' +
              'Off by default: both read component internals, and a ' +
              'legitimate state (`disabled` on a root) often selects a ' +
              'non-paint style.',
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
    const checkStateSurface = options.checkStateSurface === true;
    const checkRootTargets = options.checkRootTargets === true;
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

      const {all, conditional} = scanner.styleArguments(opening);

      // Resolve every style the element applies. One unknown and the element
      // is out of scope — see the file header.
      const properties = [];
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
          const isRoot = isRootTarget(rootNames, target.name);
          if (isRoot && !checkRootTargets) {
            continue;
          }
          context.report({
            node: target.node,
            messageId: isRoot ? 'layoutOnlyRootTarget' : 'layoutOnlyTarget',
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

      if (!checkStateSurface) {
        return;
      }

      // --- Opt-in: principle 2, "state and size are data on the target" -----

      /** State words the element's conditional styles actually switch on. */
      const conditionalWords = new Set();
      /** Properties selected by RUNTIME state specifically. */
      const runtimeStateProperties = [];
      let runtimeStateArgs = 0;
      let conditionalResolved = true;
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
        const isRuntime = [...words].some((word) =>
          RUNTIME_STATE_HINTS.has(word),
        );
        const resolved = scanner.resolveStyleProperties(argument);
        if (resolved == null) {
          conditionalResolved = false;
          continue;
        }
        if (isRuntime) {
          runtimeStateArgs++;
          runtimeStateProperties.push(...resolved);
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

        const declaresRuntimeState = [...declared].some((key) =>
          RUNTIME_STATE_HINTS.has(key),
        );
        if (declaresRuntimeState && conditionalResolved && runtimeStateArgs > 0) {
          const bucketed = classifyProperties(runtimeStateProperties);
          if (bucketed.paint.length === 0 && !bucketed.hasVar) {
            context.report({
              node: target.node,
              messageId: 'stateVariesOnlyLayout',
              data: {
                target: target.name,
                props: [...declared].join(', '),
                properties: [
                  ...new Set([...bucketed.layout, ...bucketed.neutral]),
                ]
                  .slice(0, 6)
                  .join(', '),
              },
            });
          }
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
      },
    };

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
