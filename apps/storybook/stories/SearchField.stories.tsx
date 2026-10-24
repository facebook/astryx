// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useLayoutEffect, useRef, useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {useTouchPresentation} from '@astryxdesign/core/gestures/experimental';
import {
  cubicBezier,
  resolveMotion,
  uikit,
  useAnimator,
  type MotionCurve,
} from '@astryxdesign/core/motion/experimental';
import {SearchField} from '@astryxdesign/lab';

// =============================================================================
// Meta
// =============================================================================

const meta: Meta<typeof SearchField> = {
  title: 'Lab/SearchField',
  component: SearchField,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof SearchField>;

// =============================================================================
// A screen like the one UIKit's captures were taken on: a large title, the
// field under it, results below
// =============================================================================

const FRUITS = [
  'Apple',
  'Apricot',
  'Banana',
  'Blueberry',
  'Cherry',
  'Grapefruit',
  'Mango',
  'Orange',
  'Peach',
  'Pear',
  'Plum',
  'Raspberry',
  'Strawberry',
  'Watermelon',
];

const page: React.CSSProperties = {
  minHeight: '100vh',
  boxSizing: 'border-box',
  paddingTop: 8,
  fontFamily: 'system-ui, sans-serif',
};
const largeTitle: React.CSSProperties = {
  margin: 0,
  padding: '4px 16px 8px',
  fontSize: 34,
  fontWeight: 700,
  lineHeight: '41px',
};
const list: React.CSSProperties = {
  listStyle: 'none',
  margin: '8px 0 0',
  padding: 0,
};
const row: React.CSSProperties = {
  padding: '12px 16px',
  borderBottom: '1px solid rgba(127, 127, 127, 0.2)',
  fontSize: 17,
};

/** A curve the animator plays: `value(progress(t))` over `duration` s. */
function curve(
  duration: number,
  value: (p: number) => number,
  progress: (t: number) => number,
): MotionCurve {
  const at = (t: number) => value(progress(t));
  return {
    duration,
    at,
    velocity: t => {
      if (duration <= 0 || t >= duration) {
        return 0;
      }
      const a = Math.max(0, t - 0.001);
      const b = Math.min(duration, t + 0.001);
      return (at(b) - at(a)) / (b - a);
    },
  };
}

/**
 * Runs `start` on the first frame the page has presented, by the rule the
 * field starts its activation with (lab's presentedFrame.ts): the second of
 * two frames less than 40 ms apart, at most 1 s later. Run from the same
 * commit as the field's, it starts on the field's frame.
 */
function onPresentedFrame(win: Window, start: () => void): () => void {
  const begin = win.performance.now();
  let previous: number | null = null;
  let id = 0;
  let done = false;
  const step = (time: number) => {
    if ((previous != null && time - previous < 40) || time - begin > 1000) {
      done = true;
      start();
      return;
    }
    previous = time;
    id = win.requestAnimationFrame(step);
  };
  id = win.requestAnimationFrame(step);
  return () => {
    if (!done) {
      done = true;
      win.cancelAnimationFrame(id);
    }
  };
}

/**
 * The host's half of a lift, as a navigation bar does it (NavigationStack
 * runs the real one): the content rises with the field by `lift` on the
 * field's clock, and the large title fades as UIKit's does (opacity
 * (1 − p / 0.35)² on activation; on cancel it comes back from p = 0.65).
 * Placed at once under a mouse, as the field is.
 */
function useLiftedHost(isActive: boolean, lift: number) {
  const content = useAnimator();
  const title = useAnimator();
  const {isTouch} = useTouchPresentation();
  const settled = useRef<boolean | null>(null);
  useLayoutEffect(() => {
    const target = isActive && lift > 0;
    const y = target ? -lift : 0;
    if (settled.current === null || !isTouch || lift === 0) {
      settled.current = target;
      content.animator.set({y});
      title.animator.set({opacity: target ? 0 : 1});
      return;
    }
    if (settled.current === target) {
      return;
    }
    settled.current = target;
    const element = content.animator.element;
    const win = element?.ownerDocument.defaultView;
    if (element == null || win == null) {
      return;
    }
    return onPresentedFrame(win, () => move(element));
    function move(element: HTMLElement) {
      const seconds =
        resolveMotion(element, uikit.search, 'activationMs') / 1000;
      const ease = cubicBezier(
        resolveMotion(element, uikit.search.activationCurve),
      );
      // A reversal starts where the content is, on the rest of the clock.
      const fromY = content.animator.get('y');
      const remaining = Math.min(1, Math.abs(y - fromY) / lift);
      const duration = seconds * remaining;
      const start = 1 - remaining;
      const progress = (t: number) =>
        start +
        remaining *
          ease(duration > 0 ? Math.min(1, Math.max(0, t / duration)) : 1);
      // `p` is the activation's progress (1 = active), whichever way it runs.
      const activation = (p: number) => (target ? p : 1 - p);
      content.animator.play({
        y: curve(duration, p => -lift * activation(p), progress),
      });
      title.animator.play({
        opacity: curve(
          duration,
          p => {
            const a = activation(p);
            return target
              ? Math.max(0, 1 - a / 0.35) ** 2
              : Math.min(1, Math.max(0, (1 - a - 0.65) / 0.35));
          },
          progress,
        ),
      });
    }
  }, [isActive, lift, isTouch, content, title]);
  return {contentRef: content.ref, titleRef: title.ref};
}

function Screen({
  lift = 0,
  initialQuery = '',
  initiallyActive = false,
  dir,
}: {
  lift?: number;
  initialQuery?: string;
  initiallyActive?: boolean;
  dir?: 'rtl';
}) {
  const [query, setQuery] = useState(initialQuery);
  const [isActive, setIsActive] = useState(initiallyActive);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const results = FRUITS.filter(fruit =>
    fruit.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const {contentRef, titleRef} = useLiftedHost(isActive, lift);
  return (
    <div style={page} dir={dir}>
      <h1 ref={titleRef} style={largeTitle}>
        Search
      </h1>
      <SearchField
        label="Search"
        placeholder="Fruits"
        value={query}
        onChange={setQuery}
        isActive={isActive}
        onActiveChange={setIsActive}
        onSubmit={setSubmitted}
        lift={lift}
      />
      <div ref={contentRef} data-search-story-content="">
        <ul style={list} aria-label="Results">
          {results.map(fruit => (
            <li key={fruit} style={row}>
              {fruit}
            </li>
          ))}
        </ul>
        <p
          data-testid="search-state"
          style={{padding: '0 16px', fontSize: 13, opacity: 0.6}}>
          {isActive ? 'active' : 'inactive'}
          {submitted != null ? ` · submitted "${submitted}"` : ''}
        </p>
      </div>
    </div>
  );
}

/**
 * The stacked field under a large title. A tap activates it: the field
 * narrows and the glass close button slides in, on UIKit's 383 ms curve.
 */
export const Default: Story = {
  render: () => <Screen />,
};

/**
 * Active from the start, with a query: the clear button inside the field and
 * the close button beside it.
 */
export const ActiveWithQuery: Story = {
  render: () => <Screen initiallyActive initialQuery="ap" />,
};

/**
 * Lifted as a navigation bar lifts it: the active field rises over the large
 * title (its 53 px here; 99 px from under the title to the bar's row on an
 * iPhone 17 Pro) and the results rise with it, while the title fades. The
 * screen stands in for the bar here (NavigationStack runs the real one), on
 * the field's clock and UIKit's measured title fade.
 */
export const Lifted: Story = {
  render: () => <Screen lift={53} />,
};

/** Right to left: the field narrows from the left; the close button slides in from there. */
export const RightToLeft: Story = {
  render: () => <Screen dir="rtl" />,
};
