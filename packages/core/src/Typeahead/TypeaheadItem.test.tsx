// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file TypeaheadItem.test.tsx
 * @input Uses vitest, @testing-library/react
 * @output Unit tests for TypeaheadItem
 * @position Colocated unit test; covers the label/icon/description layout, the
 *   disabled dimming, and the pre-rendered `item.element` short-circuit
 */

import {describe, it, expect} from 'vitest';
import {createRef, type ReactElement} from 'react';
import {render, screen} from '@testing-library/react';
import {TypeaheadItem} from './TypeaheadItem';
import type {SearchableItem} from './types';
import {declaredValue} from '../__tests__/stylexDeclarations';

const item: SearchableItem = {id: '1', label: 'Jane Doe'};

function renderItem(ui: ReactElement): HTMLElement {
  const {container} = render(ui);
  return container.firstElementChild as HTMLElement;
}

describe('TypeaheadItem', () => {
  it('renders the item label', () => {
    render(<TypeaheadItem item={item} />);
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });

  it('carries the stable astryx class for theme targeting', () => {
    const root = renderItem(<TypeaheadItem item={item} />);
    expect(root.className.split(' ')).toContain('astryx-typeahead-item');
  });

  it('renders the description below the label when provided', () => {
    const root = renderItem(
      <TypeaheadItem item={item} description="Engineer" />,
    );
    const content = root.lastElementChild!;
    expect(Array.from(content.children).map(c => c.textContent)).toEqual([
      'Jane Doe',
      'Engineer',
    ]);
  });

  it('renders no description element when none is provided', () => {
    const root = renderItem(<TypeaheadItem item={item} />);
    const content = root.lastElementChild!;
    expect(content.children.length).toBe(1);
    expect(content.textContent).toBe('Jane Doe');
  });

  it('renders the icon before the label content', () => {
    const root = renderItem(
      <TypeaheadItem item={item} icon={<svg data-testid="avatar" />} />,
    );
    expect(root.children.length).toBe(2);
    expect(root.firstElementChild).toBe(screen.getByTestId('avatar'));
  });

  it('dims the row when isDisabled is set', () => {
    const root = renderItem(<TypeaheadItem item={item} isDisabled />);
    expect(declaredValue(root, 'opacity')).toBe('0.5');
  });

  it('does not dim the row by default', () => {
    const root = renderItem(<TypeaheadItem item={item} />);
    expect(declaredValue(root, 'opacity')).toBeNull();
  });

  it('forwards ref to the row element', () => {
    const ref = createRef<HTMLDivElement>();
    const root = renderItem(<TypeaheadItem item={item} ref={ref} />);
    expect(ref.current).toBe(root);
  });

  it('renders item.element raw instead of the label layout', () => {
    const {container} = render(
      <TypeaheadItem
        item={{
          id: '1',
          label: 'Never shown',
          element: <div data-testid="prerendered">Pre-rendered row</div>,
        }}
      />,
    );
    expect(screen.getByTestId('prerendered')).toBe(container.firstElementChild);
    expect(container.children.length).toBe(1);
    expect(screen.queryByText('Never shown')).not.toBeInTheDocument();
    expect(
      container.querySelector('.astryx-typeahead-item'),
    ).not.toBeInTheDocument();
  });

  it('ignores icon, description and isDisabled when item.element is set', () => {
    const {container} = render(
      <TypeaheadItem
        item={{
          id: '1',
          label: 'Never shown',
          element: <div data-testid="prerendered">Pre-rendered row</div>,
        }}
        icon={<svg data-testid="avatar" />}
        description="Engineer"
        isDisabled
      />,
    );
    expect(screen.queryByTestId('avatar')).not.toBeInTheDocument();
    expect(screen.queryByText('Engineer')).not.toBeInTheDocument();
    // The caller's element is rendered raw — not wrapped in the styled row —
    // so the isDisabled dimming has nowhere to land.
    const root = container.firstElementChild!;
    expect(root).toHaveAttribute('data-testid', 'prerendered');
    expect(root.className).toBe('');
  });
});
