// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, test} from 'vitest';
import {applyTransform} from 'jscodeshift/dist/testUtils.js';
import transform from '../transforms/v0.0.15/rename-imperative-ref-to-handleRef.mjs';

const opts = {parser: 'tsx'};

describe('rename-imperative-ref-to-handleRef', () => {
  test.each([
    'XDSCalendar',
    'XDSChatComposerInput',
    'XDSPowerSearch',
    'XDSTokenizer',
    'XDSChartStreamGL',
  ])('renames ref on %s', componentName => {
    const input = `<${componentName} ref={handleRef} />`;
    const output = applyTransform({default: transform, parser: 'tsx'}, opts, {
      source: input,
    });

    expect(output).toContain('handleRef={handleRef}');
    expect(output).not.toContain('ref={handleRef}');
  });

  test('renames sideNavRef on XDSSideNavCollapseButton', () => {
    const input = `<XDSSideNavCollapseButton sideNavRef={sideNavRef} />`;
    const output = applyTransform({default: transform, parser: 'tsx'}, opts, {
      source: input,
    });

    expect(output).toContain('handleRef={sideNavRef}');
    expect(output).not.toContain('sideNavRef=');
  });

  test('does not rename ref on DOM elements or unrelated components', () => {
    const input = `
      <>
        <div ref={rootRef} />
        <XDSButton ref={buttonRef} label="Save" />
      </>
    `;
    const output = applyTransform({default: transform, parser: 'tsx'}, opts, {
      source: input,
    });

    expect(output).toBe('');
  });

  test('renames multiple affected props in one file', () => {
    const input = `
      <>
        <XDSCalendar ref={calendarRef} />
        <XDSSideNavCollapseButton sideNavRef={sideNavRef} />
      </>
    `;
    const output = applyTransform({default: transform, parser: 'tsx'}, opts, {
      source: input,
    });

    expect(output.match(/handleRef=/g)).toHaveLength(2);
    expect(output).not.toContain('sideNavRef=');
    expect(output).not.toContain('ref={calendarRef}');
  });
});
