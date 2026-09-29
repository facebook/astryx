// Copyright (c) Meta Platforms, Inc. and affiliates.

import {render, screen} from '@testing-library/react';
import {afterAll, beforeAll, describe, expect, it, vi} from 'vitest';
import {Markdown} from '../index';
import {markdownMermaidPlugin} from './index';

class TestStyleSheet {
  cssRules: {cssText: string}[] = [];

  insertRule(cssText: string, index = this.cssRules.length): number {
    this.cssRules.splice(index, 0, {cssText});
    return index;
  }

  replaceSync(cssText: string): void {
    this.cssRules = [{cssText}];
  }
}

type SvgMeasurementPrototype = {
  getBBox?: () => {height: number; width: number; x: number; y: number};
  getComputedTextLength?: () => number;
};

const svgMeasurementPrototype = SVGElement.prototype as SvgMeasurementPrototype;
let originalGetBBox: SvgMeasurementPrototype['getBBox'];
let originalGetComputedTextLength: SvgMeasurementPrototype['getComputedTextLength'];

beforeAll(() => {
  if (typeof CSSStyleSheet === 'undefined') {
    vi.stubGlobal('CSSStyleSheet', TestStyleSheet);
  }
  originalGetBBox = svgMeasurementPrototype.getBBox;
  originalGetComputedTextLength = svgMeasurementPrototype.getComputedTextLength;
  svgMeasurementPrototype.getBBox = () => ({
    x: 0,
    y: 0,
    width: 100,
    height: 20,
  });
  svgMeasurementPrototype.getComputedTextLength = () => 100;
});

afterAll(() => {
  if (originalGetBBox == null) {
    Reflect.deleteProperty(svgMeasurementPrototype, 'getBBox');
  } else {
    svgMeasurementPrototype.getBBox = originalGetBBox;
  }
  if (originalGetComputedTextLength == null) {
    Reflect.deleteProperty(svgMeasurementPrototype, 'getComputedTextLength');
  } else {
    svgMeasurementPrototype.getComputedTextLength =
      originalGetComputedTextLength;
  }
  vi.unstubAllGlobals();
});

describe('Markdown Mermaid with Mermaid', () => {
  it('renders a real strict SVG without HTML labels', async () => {
    const source =
      '```mermaid title="Release flow"\nflowchart LR\n  Draft --> Published\n```';
    render(<Markdown plugins={[markdownMermaidPlugin]}>{source}</Markdown>);

    const diagram = await screen.findByRole(
      'img',
      {name: 'Release flow'},
      {timeout: 10_000},
    );
    expect(diagram.querySelector('svg')).not.toBeNull();
    expect(diagram).toBeVisible();
    expect(diagram.querySelector('foreignObject')).toBeNull();
    expect(diagram.querySelector('script')).toBeNull();
    expect(diagram.textContent).toContain('Draft');
    expect(diagram.textContent).toContain('Published');
  });
});
