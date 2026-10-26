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
import {act, render, renderHook, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useRef, type ReactNode} from 'react';
import {Collapsible} from '../Collapsible/Collapsible';
import {CollapsibleGroup} from '../Collapsible/CollapsibleGroup';
import {TreeList} from '../TreeList/TreeList';
import type {TreeListItemData} from '../TreeList/TreeListTypes';
import {
  useAnimatedLayout,
  type AnimatedLayout,
} from '../hooks/useAnimatedLayout';

let animated: Element[] = [];
/** Each animation's finish listener, by the element it plays on. */
let finishes = new Map<Element, () => void>();
const originalAnimate = Element.prototype.animate;

beforeEach(() => {
  animated = [];
  finishes = new Map();
  Element.prototype.animate = function (this: Element) {
    animated.push(this);
    const element = this;
    return {
      cancel() {},
      addEventListener(type: string, listener: () => void) {
        if (type === 'finish') {
          finishes.set(element, listener);
        }
      },
    } as unknown as Animation;
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

describe('Collapsible changes another component made (spec:AST-105 FR3)', () => {
  it('glides the items between when a single-mode group closes one item to open another', async () => {
    const user = userEvent.setup();
    render(
      <Area withHandle>
        {layout => (
          <CollapsibleGroup type="single" defaultValue="shipping">
            <Collapsible
              value="shipping"
              trigger="Shipping"
              animatedLayout={layout}>
              Shipping details
            </Collapsible>
            <Collapsible
              value="payment"
              trigger="Payment"
              animatedLayout={layout}>
              Payment details
            </Collapsible>
            <Collapsible
              value="warranty"
              trigger="Warranty"
              animatedLayout={layout}>
              Warranty details
            </Collapsible>
          </CollapsibleGroup>
        )}
      </Area>,
    );
    stubGeometry();
    // The Payment item sits between the one that closes and the one that
    // opens: it moves up when Shipping closes.
    const payment = screen
      .getByRole('button', {name: 'Payment'})
      .closest<HTMLElement>('.astryx-collapsible');
    expect(payment).not.toBeNull();
    let reads = 0;
    vi.spyOn(
      payment as HTMLElement,
      'getBoundingClientRect',
    ).mockImplementation(() => {
      reads += 1;
      return new DOMRect(0, reads === 1 ? 140 : 40, 400, 40);
    });
    await user.click(screen.getByRole('button', {name: 'Warranty'}));
    await flush();
    expect(animated).toContain(payment);
  });

  it('lands an owner-set isOpen at once, entrance included', async () => {
    const {rerender} = render(
      <Area withHandle>
        {layout => (
          <Collapsible trigger="Details" isOpen={false} animatedLayout={layout}>
            Hidden content
          </Collapsible>
        )}
      </Area>,
    );
    stubGeometry();
    // The content is in view, so an entrance would play if one ran.
    const contentId = screen
      .getByRole('button', {name: 'Details'})
      .getAttribute('aria-controls');
    const content = document.getElementById(contentId ?? '');
    expect(content).not.toBeNull();
    vi.spyOn(content as HTMLElement, 'getBoundingClientRect').mockReturnValue(
      new DOMRect(0, 40, 400, 40),
    );
    rerender(
      <Area withHandle>
        {layout => (
          <Collapsible trigger="Details" isOpen animatedLayout={layout}>
            Hidden content
          </Collapsible>
        )}
      </Area>,
    );
    await flush();
    expect(animated).toEqual([]);
  });
});

describe("a close plays the content's exit (spec:AST-105 FR4)", () => {
  it("keeps a closing Collapsible's content rendered, inert and out of flow until its exit ends", async () => {
    const user = userEvent.setup();
    render(
      <Area withHandle>
        {layout => (
          <Collapsible trigger="Details" defaultIsOpen animatedLayout={layout}>
            Shown content
          </Collapsible>
        )}
      </Area>,
    );
    stubGeometry();
    const trigger = screen.getByRole('button', {name: 'Details'});
    const content = document.getElementById(
      trigger.getAttribute('aria-controls') ?? '',
    ) as HTMLElement;
    vi.spyOn(content, 'getBoundingClientRect').mockReturnValue(
      new DOMRect(0, 40, 400, 40),
    );
    await user.click(trigger);
    await flush();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    // Still on screen for the exit, but out of reach and out of flow.
    expect(getComputedStyle(content).display).not.toBe('none');
    expect(content).toHaveAttribute('inert');
    expect(content).toHaveAttribute('aria-hidden', 'true');
    expect(content.style.position).toBe('absolute');
    expect(animated).toContain(screen.getByTestId('after'));
    act(() => finishes.get(content)?.());
    expect(getComputedStyle(content).display).toBe('none');
    expect(content).not.toHaveAttribute('inert');
    expect(content.style.position).toBe('');
  });

  it("keeps a collapsing TreeList row's child group until its exit ends, out of the keyboard order", async () => {
    const user = userEvent.setup();
    render(
      <Area withHandle>
        {layout => (
          <TreeList
            items={[
              {
                id: 'src',
                label: 'src',
                isExpanded: true,
                children: [{id: 'index', label: 'index.ts'}],
              },
            ]}
            animatedLayout={layout}
          />
        )}
      </Area>,
    );
    stubGeometry();
    const groupOf = () =>
      document.querySelector<HTMLElement>(
        '[data-tree-id="src"] > [role="group"]',
      );
    vi.spyOn(groupOf() as HTMLElement, 'getBoundingClientRect').mockReturnValue(
      new DOMRect(0, 40, 400, 40),
    );
    await user.click(
      document.querySelector<HTMLElement>('[data-tree-toggle]') ??
        document.body,
    );
    await flush();
    const group = groupOf();
    expect(group).not.toBeNull();
    expect(group).toHaveAttribute('inert');
    expect(group).toHaveAttribute('aria-hidden', 'true');
    expect(group?.style.position).toBe('absolute');
    // The tree's keyboard order (the rows its focus model reaches) has only
    // the collapsed row.
    expect(
      document.querySelectorAll('[role="treeitem"]:not([data-tree-exiting] *)'),
    ).toHaveLength(1);
    act(() => finishes.get(group as HTMLElement)?.());
    expect(groupOf()).toBeNull();
  });

  it('lands a close at once without a handle', async () => {
    const user = userEvent.setup();
    render(
      <Area withHandle={false}>
        {layout => (
          <Collapsible trigger="Details" defaultIsOpen animatedLayout={layout}>
            Shown content
          </Collapsible>
        )}
      </Area>,
    );
    const trigger = screen.getByRole('button', {name: 'Details'});
    await user.click(trigger);
    const content = document.getElementById(
      trigger.getAttribute('aria-controls') ?? '',
    ) as HTMLElement;
    expect(getComputedStyle(content).display).toBe('none');
    expect(content).not.toHaveAttribute('inert');
  });
});
