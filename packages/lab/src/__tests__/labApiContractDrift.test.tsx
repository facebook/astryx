// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';

import {docs as ChatReasoningDocs} from '../ChatReasoning/ChatReasoning.doc.mjs';
import {docs as CodeEditorDocs} from '../CodeEditor/CodeEditor.doc.mjs';
import {docs as LogStreamDocs} from '../LogStream/LogStream.doc.mjs';
import {docs as StepperDocs} from '../Stepper/Stepper.doc.mjs';

function getProps(docs: Record<string, unknown>): Array<{name: string}> {
  return (
    (docs.props as Array<{name: string}>) ||
    (
      docs.components as Array<{
        props: Array<{name: string}>;
      }>
    )?.[0]?.props ||
    []
  );
}

describe('Lab API Contract Drift (#4163)', () => {
  it('documents ChatReasoning props', () => {
    const props = getProps(ChatReasoningDocs).map(p => p.name);
    expect(props).toContain('duration');
    expect(props).toContain('isStreaming');
    expect(props).toContain('isExpanded');
    expect(props).toContain('defaultIsExpanded');
    expect(props).toContain('onExpandedChange');
  });

  it('documents CodeEditor props', () => {
    const props = getProps(CodeEditorDocs).map(p => p.name);
    expect(props).toContain('language');
    expect(props).toContain('hasLineNumbers');
    expect(props).toContain('isReadOnly');
    expect(props).toContain('placeholder');
    expect(props).toContain('maxHeight');
    expect(props).toContain('size');
    expect(props).toContain('tokenizer');
  });

  it('documents LogStream props', () => {
    const props = getProps(LogStreamDocs).map(p => p.name);
    expect(props).toContain('variant');
    expect(props).toContain('isFollowing');
    expect(props).toContain('onFollowChange');
    expect(props).toContain('maxHeight');
    expect(props).toContain('hasTimestamps');
    expect(props).toContain('renderEntry');
  });

  it('documents Stepper indicatorPosition prop', () => {
    const props = getProps(StepperDocs).map(p => p.name);
    expect(props).toContain('indicatorPosition');
  });
});
