// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, test} from 'vitest';
import {applyTransform} from 'jscodeshift/dist/testUtils.js';
import transform from '../transforms/v0.0.15/rename-isStreaming-to-isStopShown.mjs';

const opts = {parser: 'tsx'};

describe('rename-isStreaming-to-isStopShown', () => {
  test('renames isStreaming prop on XDSChatComposer', () => {
    const input = `<XDSChatComposer isStreaming={isStreaming} onSubmit={handleSubmit} />`;
    const output = applyTransform({default: transform, parser: 'tsx'}, opts, {source: input});
    expect(output).toContain('isStopShown={isStreaming}');
    expect(output).not.toContain('isStreaming={');
  });

  test('renames boolean isStreaming prop on XDSChatSendButton', () => {
    const input = `<XDSChatSendButton isStreaming onStop={() => {}} />`;
    const output = applyTransform({default: transform, parser: 'tsx'}, opts, {source: input});
    expect(output).toContain('isStopShown');
    expect(output).not.toContain('isStreaming');
  });

  test('renames isStreaming with expression value', () => {
    const input = `<XDSChatComposer isStreaming={state.active} onSubmit={fn} />`;
    const output = applyTransform({default: transform, parser: 'tsx'}, opts, {source: input});
    expect(output).toContain('isStopShown={state.active}');
  });

  test('does not rename isStreaming on unrelated components', () => {
    const input = `<XDSMarkdown isStreaming={true} />`;
    const output = applyTransform({default: transform, parser: 'tsx'}, opts, {source: input});
    expect(output).toBe('');
  });

  test('does not rename isStreaming on XDSChatReasoning', () => {
    const input = `<XDSChatReasoning isStreaming label="Thinking" />`;
    const output = applyTransform({default: transform, parser: 'tsx'}, opts, {source: input});
    expect(output).toBe('');
  });

  test('renames both components in the same file', () => {
    const input = `
      <XDSChatComposer isStreaming={streaming} onSubmit={fn}>
        <XDSChatSendButton isStreaming={streaming} />
      </XDSChatComposer>
    `;
    const output = applyTransform({default: transform, parser: 'tsx'}, opts, {source: input});
    expect(output).not.toContain('isStreaming');
    expect(output.match(/isStopShown/g)).toHaveLength(2);
  });

  test('leaves files without target components unchanged', () => {
    const input = `const isStreaming = true;`;
    const output = applyTransform({default: transform, parser: 'tsx'}, opts, {source: input});
    expect(output).toBe('');
  });
});
