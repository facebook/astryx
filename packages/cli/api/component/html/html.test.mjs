// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import * as path from 'node:path';
import {componentHtml} from './html.mjs';

const FIXTURE = path.resolve(
  import.meta.dirname,
  '../../../test/fixtures/vanilla-project',
);

describe('componentHtml()', () => {
  it('lists sorted vanilla markup files', () => {
    expect(componentHtml(undefined, {cwd: FIXTURE, list: true})).toEqual({
      type: 'component.html.list',
      data: [{name: 'Button', file: 'Button.html'}],
    });
  });

  it('returns docs and variants verbatim', () => {
    const result = componentHtml('Button', {cwd: FIXTURE});
    expect(result.type).toBe('component.html');
    expect(result.data.source).toContain(
      '<!-- docs: A button triggers an action. -->',
    );
    expect(result.data.source).toContain('<!-- variant: primary -->');
    expect(result.data.source).toContain('ax-button--secondary');
  });

  it('rejects traversal-shaped names', () => {
    expect(() => componentHtml('../Button', {cwd: FIXTURE})).toThrow(
      /Invalid vanilla component name/,
    );
  });

  it('reports a missing markup file as an unknown component', () => {
    const error = (() => {
      try {
        componentHtml('Card', {cwd: FIXTURE});
      } catch (caught) {
        return caught;
      }
    })();
    expect(error.code).toBe('ERR_UNKNOWN_COMPONENT');
  });
});
