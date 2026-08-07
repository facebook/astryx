// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file themeprops-reflection.js
 * @description `themeProps()` returns a class token AND the `data-*`
 * reflection of the visual props. Spread the whole thing; do not take the
 * class and leave the state behind, and do not hand-author the state next to
 * it.
 *
 * Canonical criteria: principle 2 of "Principles for authoring theming
 * targets" in the wiki's Theming Infrastructure page —
 * https://github.com/facebook/astryx/wiki/Theming-Infrastructure
 *
 * `themeProps('selector', {size, variant})` returns
 * `{className: 'astryx-selector md secondary', 'data-size': 'md',
 * 'data-variant': 'secondary'}`. Two shapes break that pairing:
 *
 *   className={themeProps('x', {size}).className}   // data-size never renders
 *   <div data-state="open" {...themeProps('x')} />  // state bypasses themeProps
 *
 * The first silently drops the `[data-*]` selectors themes are told to target;
 * a theme rule that works in one component stops working in this one. The
 * second is the same divergence from the other side: the class token and the
 * attribute must be emitted together, or they drift (principle 2).
 *
 * Fix: spread the call — `{...themeProps('x', {size})}` — or merge it with
 * `mergeProps(themeProps('x', {size}), stylex.props(styles.root))`. For a
 * composed Astryx component, spread it onto that component, which forwards the
 * attributes through its BaseProps passthrough.
 *
 * Severity note: `droppedStateReflection` (a call that passes visual props) is
 * a live bug — those attributes are simply missing from the DOM.
 * `classNameOnly` (no visual props yet) drops nothing today, so it is the
 * weaker of the two; it is the shape that turns into the bug the day someone
 * adds a state to the call.
 */

import {createFileScanner} from './theming-target.js';

/**
 * State words a hand-authored `data-*` attribute would be duplicating. The
 * check is deliberately narrow: most `data-*` attributes in the codebase are
 * identity or query hooks the component's own JS reads (`data-value`,
 * `data-date`, `data-page`, `data-avatar-item`), not theming state, and
 * rewriting those through `themeProps` would change what they mean.
 */
const STATE_DATA_ATTRIBUTES = new Set([
  'data-state',
  'data-selected',
  'data-checked',
  'data-disabled',
  'data-expanded',
  'data-collapsed',
  'data-open',
  'data-active',
  'data-highlighted',
  'data-variant',
  'data-size',
  'data-status',
  'data-orientation',
]);

const rule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Spread the whole themeProps() result — taking .className drops the data-* state reflection',
      category: 'Possible Errors',
      recommended: true,
    },
    messages: {
      droppedStateReflection:
        "themeProps('{{target}}', {{{props}}}) is read as `.className`, so " +
        'data-{{first}} (and the rest of the reflection) never reaches the ' +
        'DOM — the [data-*] selectors a theme is told to use silently do ' +
        'nothing. Spread the result instead: ' +
        "{...themeProps('{{target}}', {…})}, or " +
        "mergeProps(themeProps('{{target}}', {…}), stylex.props(…)).",
      classNameOnly:
        "themeProps('{{target}}') is read as `.className`. It drops nothing " +
        'today, but the moment this target reflects a visual prop the ' +
        'attributes will be missing. Spread the whole result — ' +
        "{...themeProps('{{target}}')} — or merge it with mergeProps().",
      clobberedByLaterProp:
        "'{{attribute}}' is written AFTER the spread that carries the theme " +
        "target '{{target}}', so it overwrites it — when the consumer passes " +
        'no {{attribute}}, the {{attribute}} React sees is `undefined` and the ' +
        'target never reaches the DOM at all. Merge them instead: ' +
        "mergeProps(themeProps('{{target}}'), {{{attribute}}}), or put the " +
        'spread last.',
      bypassedThemeProps:
        "stableClassName('{{target}}') builds the theme class by hand. Only " +
        'themeProps() emits the class token together with the data-* ' +
        'reflection, so a target minted this way can never carry state. Call ' +
        "themeProps('{{target}}', {…}) and spread the result.",
      handAuthoredState:
        "'{{attribute}}' is hand-authored on an element that already carries " +
        "the theme target '{{target}}'. State must flow through themeProps " +
        "({...themeProps('{{target}}', {{{key}}: …})}), which emits the class " +
        'token and the kebab-cased data attribute together; authoring one by ' +
        'hand lets the two drift.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowDataAttributes: {
            type: 'array',
            items: {type: 'string'},
            description:
              'Attribute names that are not theming state (exact match).',
          },
          allowFiles: {
            type: 'array',
            items: {type: 'string'},
            description: 'Substring match on the filename.',
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const options = context.options[0] ?? {};
    const allowDataAttributes = new Set(options.allowDataAttributes ?? []);
    const allowFiles = options.allowFiles ?? [];
    const scanner = createFileScanner(context);
    if (allowFiles.some((pattern) => scanner.filename.includes(pattern))) {
      return {};
    }

    const elements = [];
    /** Every `themeProps()` call in the file, for the non-JSX `.className` reads. */
    const bareCalls = [];

    /** `.className` reads that are not attached to any JSX element. */
    function checkBareCall(node) {
      const parent = node.parent;
      if (
        parent?.type !== 'MemberExpression' ||
        parent.object !== node ||
        parent.computed ||
        parent.property?.name !== 'className'
      ) {
        return;
      }
      report(node);
    }

    function report(callNode) {
      const [nameArg, propsArg] = callNode.arguments;
      if (nameArg?.type !== 'Literal' || typeof nameArg.value !== 'string') {
        return;
      }
      const keys =
        propsArg?.type === 'ObjectExpression'
          ? propsArg.properties
              .filter((property) => property.type === 'Property')
              .map(
                (property) =>
                  property.key?.name ?? String(property.key?.value ?? '?'),
              )
          : [];
      if (propsArg != null && keys.length > 0) {
        context.report({
          node: callNode,
          messageId: 'droppedStateReflection',
          data: {
            target: nameArg.value,
            props: keys.join(', '),
            first: keys[0].replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase(),
          },
        });
        return;
      }
      context.report({
        node: callNode,
        messageId: 'classNameOnly',
        data: {target: nameArg.value},
      });
    }

    function checkElement(node) {
      const opening = node.openingElement;
      const targets = scanner
        .themeTargets(opening)
        .filter((target) => target.name != null);
      if (targets.length === 0) {
        return;
      }

      // `{...themeProps('x')} className={className}` — the later attribute
      // wins, target and all. (ChatSendButton shipped this shape.)
      const spreadIndex = opening.attributes.findIndex(
        (attribute) =>
          attribute.type === 'JSXSpreadAttribute' &&
          scanner.themeTargets({attributes: [attribute]}).length > 0,
      );
      if (spreadIndex !== -1) {
        for (const attribute of opening.attributes.slice(spreadIndex + 1)) {
          if (
            attribute.type === 'JSXAttribute' &&
            attribute.name?.name === 'className'
          ) {
            context.report({
              node: attribute,
              messageId: 'clobberedByLaterProp',
              data: {attribute: 'className', target: targets[0].name},
            });
          }
        }
      }

      for (const target of targets) {
        if (target.viaClassName) {
          report(target.node);
        }
      }

      const named = targets[0];
      for (const attribute of opening.attributes) {
        if (attribute.type !== 'JSXAttribute') {
          continue;
        }
        const name = attribute.name?.name;
        if (typeof name !== 'string' || !name.startsWith('data-')) {
          continue;
        }
        if (
          allowDataAttributes.has(name) ||
          !STATE_DATA_ATTRIBUTES.has(name)
        ) {
          continue;
        }
        context.report({
          node: attribute,
          messageId: 'handAuthoredState',
          data: {
            attribute: name,
            target: named.name,
            key: name
              .slice('data-'.length)
              .replace(/-([a-z])/g, (_, character) => character.toUpperCase()),
          },
        });
      }
    }

    return {
      ImportDeclaration: scanner.importDeclaration,
      VariableDeclarator: scanner.variableDeclarator,
      JSXElement(node) {
        elements.push(node);
      },
      'Program:exit'() {
        const seen = new Set();
        for (const node of elements) {
          for (const target of scanner.themeTargets(node.openingElement)) {
            seen.add(target.node);
          }
        }
        for (const node of elements) {
          checkElement(node);
        }
        // `.className` reads outside JSX — a hook building a props object, or
        // `const cls = themeProps('table').className`.
        for (const call of bareCalls) {
          if (!seen.has(call)) {
            checkBareCall(call);
          }
        }
      },
      CallExpression(node) {
        if (
          node.callee?.type === 'Identifier' &&
          node.callee.name === 'themeProps'
        ) {
          bareCalls.push(node);
          return;
        }
        // The naming module is where the prefix lives; themeProps is the only
        // caller that should be building a stable class from it.
        if (
          node.callee?.type === 'Identifier' &&
          node.callee.name === 'stableClassName' &&
          !scanner.filename.includes('themeProps') &&
          !scanner.filename.includes('naming')
        ) {
          const [nameArg] = node.arguments;
          context.report({
            node,
            messageId: 'bypassedThemeProps',
            data: {
              target:
                nameArg?.type === 'Literal' && typeof nameArg.value === 'string'
                  ? nameArg.value
                  : 'component',
            },
          });
        }
      },
    };
  },
};

export default rule;
