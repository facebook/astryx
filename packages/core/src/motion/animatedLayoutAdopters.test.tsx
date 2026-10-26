// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file animatedLayoutAdopters.test.tsx
 * @input vitest (jsdom), React Testing Library, Collapsible, TreeList,
 *   useAnimatedLayout, a recording stand-in for Element.animate and stubbed
 *   rectangles for the content after the changed component
 * @output Checks each adopting component with and without a handle
 *   (`spec:AST-105` FR1, FR2): with one, a toggle glides the content after it
 *   inside the container and the chevron takes the spring; without one,
 *   nothing animates and the chevron keeps its own transition
 * @position Testing; the walk and the motion are covered in
 *   animatedLayout.test.ts and, in real browsers,
 *   __tests__/animatedLayout.interaction.browser.spec.ts
 */

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {render, renderHook, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useRef, type ReactNode} from 'react';
import {Collapsible} from '../Collapsible/Collapsible';
import {TreeList} from '../TreeList/TreeList';
import type {TreeListItemData} from '../TreeList/TreeListTypes';
import {
  useAnimatedLayout,
  type AnimatedLayout,
} from '../hooks/useAnimatedLayout';

let animated: Element[] = [];
const originalAnimate = Element.prototype.animate;

beforeEach(() => {
  animated = [];
  Element.prototype.animate = function (this: Element) {
    animated.push(this);
    return {} as Animation;
  };
});

afterEach(() => {
  Element.prototype.animate = originalAnimate;
  vi.restoreAllMocks();
});

/**
 * A container with `children` and a following paragraph that sits 80 px lower
 * once anything has been measured (jsdom lays nothing out).
 */
function Area({
  children,
  withHandle,
}: {
  children: (layout: AnimatedLayout | undefined) => ReactNode;
  withHandle: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const layout = useAnimatedLayout({containerRef});
  return (
    <div ref={containerRef} data-testid="area">
      {children(withHandle ? layout : undefined)}
      <p data-testid="after">Notes</p>
    </div>
  );
}

function stubGeometry() {
  const area = screen.getByTestId('area');
  const after = screen.getByTestId('after');
  vi.spyOn(area, 'getBoundingClientRect').mockReturnValue(
    new DOMRect(0, 0, 400, 600),
  );
  let reads = 0;
  vi.spyOn(after, 'getBoundingClientRect').mockImplementation(() => {
    reads += 1;
    // The first read is the measurement before the change commits.
    return new DOMRect(0, reads === 1 ? 40 : 120, 400, 20);
  });
  return after;
}

const flush = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

describe('useAnimatedLayout', () => {
  it('returns the same member-free handle on every render', () => {
    const {result, rerender} = renderHook(() =>
      useAnimatedLayout({containerRef: useRef<HTMLElement>(null)}),
    );
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
    expect(Object.keys(first)).toEqual([]);
  });
});

describe.each([
  {
    name: 'Collapsible',
    render: (layout: AnimatedLayout | undefined) => (
      <Collapsible trigger="Details" animatedLayout={layout}>
        Hidden content
      </Collapsible>
    ),
    toggle: () => screen.getByRole('button', {name: 'Details'}),
    chevron: () =>
      screen
        .getByRole('button', {name: 'Details'})
        .querySelector<HTMLElement>(':scope > .astryx-icon'),
  },
  {
    name: 'TreeList',
    render: (layout: AnimatedLayout | undefined) => (
      <TreeList
        items={
          [
            {
              id: 'src',
              label: 'src',
              children: [{id: 'index', label: 'index.ts'}],
            },
          ] satisfies TreeListItemData[]
        }
        animatedLayout={layout}
      />
    ),
    toggle: () =>
      document.querySelector<HTMLElement>('[data-tree-toggle]') ??
      document.body,
    chevron: () =>
      document.querySelector<HTMLElement>('[data-tree-toggle] > .astryx-icon'),
  },
])('$name adopts animatedLayout (spec:AST-105 FR1, FR2)', component => {
  it('glides the content after it inside the container with a handle', async () => {
    const user = userEvent.setup();
    render(<Area withHandle>{component.render}</Area>);
    const after = stubGeometry();
    await user.click(component.toggle());
    await flush();
    expect(animated).toContain(after);
    expect(
      component.chevron()?.style.getPropertyValue('transition-timing-function'),
    ).toMatch(/^linear\(/);
  });

  it('changes nothing without a handle', async () => {
    const user = userEvent.setup();
    render(<Area withHandle={false}>{component.render}</Area>);
    stubGeometry();
    await user.click(component.toggle());
    await flush();
    expect(animated).toEqual([]);
    expect(
      component.chevron()?.style.getPropertyValue('transition-duration'),
    ).toBe('');
  });
});
