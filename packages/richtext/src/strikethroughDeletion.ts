// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file strikethroughDeletion.ts
 * @input Uses lexical (TextNode, configExtension) and @lexical/html
 *   (DOMRenderExtension, domOverride).
 * @output Exports StrikethroughDeletionExtension, which renders struck-through
 *   text inside a `<del>`, the deletion core Markdown renders.
 * @position A dependency of the RichTextEditor and RichTextView extensions.
 *   Lexical draws struck text as a styled `<span>`, or as the `<strong>`,
 *   `<em>`, or `<code>` its other marks call for, so assistive technology hears
 *   no deletion where core Markdown exposes one (spec:AST-061 FR7). Giving that
 *   element a deletion role would replace the strong or emphasis role it
 *   already has; instead each struck text node's element, exactly as Lexical
 *   builds it, sits inside a `<del>`, so the deletion and every other mark are
 *   exposed together. Struck text inside a link is a deletion inside the link.
 *   The document, its Markdown, and the selection model are unchanged: the
 *   text node's element is still the one Lexical created and updates, and
 *   Lexical finds its text by walking down from the `<del>`.
 */

import {DOMRenderExtension, domOverride} from '@lexical/html';
import {
  configExtension,
  TEXT_TYPE_TO_FORMAT,
  TextNode,
  type AnyLexicalExtensionArgument,
} from 'lexical';

const DELETION_TAG = 'del';

/**
 * Whether this version of `node` is struck. Reads the version's own field:
 * Lexical's getters read the latest version, so `prevNode.hasFormat()` would
 * answer for the next one.
 */
function isStruck(node: TextNode): boolean {
  return (node.__format & TEXT_TYPE_TO_FORMAT.strikethrough) !== 0;
}

// Typed as an extension argument: its inferred type names Lexical types the
// package's declarations cannot (TS4023).
export const StrikethroughDeletionExtension: AnyLexicalExtensionArgument =
  configExtension(DOMRenderExtension, {
    overrides: [
      domOverride([TextNode], {
        $createDOM(node, $next) {
          const element = $next();
          if (!isStruck(node)) {
            return element;
          }
          const deletion = document.createElement(DELETION_TAG);
          deletion.append(element);
          return deletion;
        },
        $updateDOM(nextNode, prevNode, dom, $next, editor) {
          const struck = isStruck(nextNode);
          if (struck !== isStruck(prevNode)) {
            // Adding or removing the deletion recreates the element.
            return true;
          }
          if (!struck) {
            return $next();
          }
          // Lexical updates its own element, inside the deletion.
          const element = dom.firstElementChild;
          if (dom.tagName.toLowerCase() !== DELETION_TAG || element == null) {
            return true;
          }
          return nextNode.updateDOM(
            prevNode,
            element as HTMLElement,
            editor._config,
          );
        },
      }),
    ],
  });
