// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file LayerProvider.test.tsx
 * @input LayerProvider, useLayer, ToastViewport
 * @output Proves the provider-declared inset reaches anchored layers and the
 *   toast viewport by inheritance, and that the default is no declaration
 *   (spec:AST-059 FR6, DEC-5)
 */

import {describe, expect, it} from 'vitest';
import {fireEvent, render} from '@testing-library/react';
import {LayerProvider} from './LayerProvider';
import {useLayer} from './useLayer';
import {layerInsetProperties} from './layerInset';

function AnchoredLayer() {
  const layer = useLayer({mode: 'context'});
  return (
    <>
      <button type="button" ref={layer.ref} onClick={layer.show}>
        Open
      </button>
      {layer.render(<span>Layer</span>, {placement: 'below'})}
    </>
  );
}

describe('LayerProvider inset (spec:AST-059 FR6)', () => {
  it('declares nothing by default, so a default provider matches no provider', () => {
    expect(layerInsetProperties(undefined)).toEqual({display: 'contents'});
    expect(layerInsetProperties({})).toEqual({display: 'contents'});
    const {container} = render(
      <LayerProvider>
        <AnchoredLayer />
      </LayerProvider>,
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.display).toBe('contents');
    expect(wrapper.getAttribute('style')).not.toContain('--astryx-layer-inset');
  });

  it('writes one custom property per declared edge, pixels for numbers and lengths as written', () => {
    expect(
      layerInsetProperties({blockEnd: 56, inlineStart: 'var(--rail, 0px)'}),
    ).toEqual({
      display: 'contents',
      '--astryx-layer-inset-block-end': '56px',
      '--astryx-layer-inset-inline-start': 'var(--rail, 0px)',
    });
  });

  it('places the anchored layer and the toast viewport under the declaring wrapper so both inherit it', () => {
    const {container} = render(
      <LayerProvider inset={{blockEnd: 56}}>
        <AnchoredLayer />
      </LayerProvider>,
    );
    fireEvent.click(container.querySelector('button')!);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(
      wrapper.style.getPropertyValue('--astryx-layer-inset-block-end'),
    ).toBe('56px');
    const layer = container.querySelector('[popover="manual"]:not([role])');
    const toastViewport = container.querySelector('[popover="manual"]');
    expect(layer && wrapper.contains(layer)).toBe(true);
    expect(toastViewport && wrapper.contains(toastViewport)).toBe(true);
  });

  it('lets toast.inset replace the provider value for the toast viewport on the edges it sets', () => {
    const {container} = render(
      <LayerProvider inset={{blockEnd: 56}} toast={{inset: {bottom: 120}}}>
        <span>app</span>
      </LayerProvider>,
    );
    const viewport = container.querySelector(
      '[popover="manual"]',
    ) as HTMLElement;
    // The inline override wins over the class that reads the provider value.
    expect(viewport.style.bottom).toBe('120px');
    expect(viewport.style.insetInlineStart).toBe('');
  });
});
