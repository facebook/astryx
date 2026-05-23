// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Codemod: Rename isStreaming → isStopShown on XDSChatComposer and XDSChatSendButton
 *
 * The `isStreaming` prop on chat components was too narrow — it implied only
 * text streaming, but it actually controls whether the stop button is shown.
 * Renamed to `isStopShown` for clarity.
 *
 * Handles:
 * - JSX prop: `isStreaming` → `isStopShown` on XDSChatComposer and XDSChatSendButton
 *
 * Does NOT rename:
 * - `isStreaming` on other components (XDSMarkdown, XDSChatReasoning)
 * - Local variables, object properties, or state named `isStreaming`
 */

export const meta = {
  title: 'Rename ChatComposer/ChatSendButton isStreaming to isStopShown',
  description:
    'Renames the `isStreaming` prop to `isStopShown` on `XDSChatComposer` and ' +
    '`XDSChatSendButton`. The prop controls whether the stop button is shown — ' +
    'the new name describes the affordance rather than implying a streaming state.',
  issue: '#2328',
};

const TARGET_COMPONENTS = new Set(['XDSChatComposer', 'XDSChatSendButton']);

export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasChanges = false;

  // Rename JSX prop on target components only
  root.find(j.JSXOpeningElement).forEach((path) => {
    const name = path.node.name;
    const componentName = name.type === 'JSXIdentifier' ? name.name : null;
    if (!TARGET_COMPONENTS.has(componentName)) return;

    const attrs = path.node.attributes;
    for (const attr of attrs) {
      if (attr.type === 'JSXAttribute' && attr.name?.name === 'isStreaming') {
        attr.name.name = 'isStopShown';
        hasChanges = true;
      }
    }
  });

  if (!hasChanges) return undefined;
  return root.toSource({quote: 'single'});
}
