// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file adaptationStories.test.tsx
 * @input Uses vitest, @testing-library/react, and the date components' story
 *   modules
 * @output Smoke coverage: every story that AUTHORS an adaptations policy
 *   actually mounts
 * @position Tests; the gate that catches a story whose policy is rejected at
 *   render.
 *
 * An adaptations policy is validated eagerly, so a story can author one that
 * throws — a `native` value beside a prop the platform picker cannot express,
 * for instance. Nothing else here notices. The a11y audit loads each story in a
 * real browser, but a story that throws renders an empty page, and axe reports
 * an empty page as zero violations: a broken story passes the gate by being
 * blank. The visual pass and the docsite reach the same non-conclusion.
 *
 * So this asserts the one thing those cannot: the story mounts. It selects
 * stories by name rather than listing them, so a policy story added later is
 * covered the day it lands, and it deliberately does NOT render the rest of
 * each file — those stories authored no policy and have nothing to fail this
 * way.
 *
 * SYNC: When a component gains an adaptations policy and stories for it, add
 * its story module to STORY_MODULES below.
 * - /apps/storybook/stories/DateInput.stories.tsx
 * - /apps/storybook/stories/DateTimeInput.stories.tsx
 */

import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  vi,
} from 'vitest';
import {render, cleanup} from '@testing-library/react';
import type {ReactElement} from 'react';
import * as DateInputStories from './DateInput.stories';
import * as DateTimeInputStories from './DateTimeInput.stories';

/** Story modules whose exports may author an adaptations policy. */
const STORY_MODULES = {
  DateInput: DateInputStories,
  DateTimeInput: DateTimeInputStories,
} as const;

/**
 * A story object, as far as this test needs to know: something with a `render`
 * that takes no required arguments. Stories driven by `args` are out of scope —
 * none of the policy stories use them, and calling one with no args would fail
 * for a reason that has nothing to do with its policy.
 */
interface RenderableStory {
  name?: string;
  render?: (...args: never[]) => ReactElement;
}

function policyStories(
  module: Record<string, unknown>,
): Array<[string, RenderableStory]> {
  return Object.entries(module)
    .filter(([exportName]) => exportName.startsWith('Adaptations'))
    .map(([exportName, story]) => [exportName, story as RenderableStory]);
}

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeAll(() => {
  Element.prototype.scrollTo = vi.fn();
  // jsdom implements none of these, and the touch surfaces mount a dialog.
  HTMLDialogElement.prototype.showModal = vi.fn(function (
    this: HTMLDialogElement,
  ) {
    this.open = true;
  });
  HTMLDialogElement.prototype.show = vi.fn(function (this: HTMLDialogElement) {
    this.open = true;
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.open = false;
  });
});

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', MockResizeObserver);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

for (const [component, module] of Object.entries(STORY_MODULES)) {
  describe(`${component} adaptations stories`, () => {
    const stories = policyStories(module);

    it('has at least one, so a rename cannot empty this suite silently', () => {
      expect(stories.length).toBeGreaterThan(0);
    });

    for (const [exportName, story] of stories) {
      it(`${exportName} mounts`, () => {
        const {render: renderStory} = story;
        expect(renderStory).toBeTypeOf('function');
        // Mounted as a COMPONENT, not invoked: a story's render body calls
        // hooks (`useState` for the controlled value), which are only legal
        // while React is rendering it.
        const Story = renderStory as () => ReactElement;
        // Throwing here is the whole point: an eagerly-rejected policy — a
        // `native` value beside a prop the platform cannot express — fails on
        // the render, naming the offending policy path.
        expect(() => render(<Story />)).not.toThrow();
        expect(document.querySelector('input')).not.toBeNull();
      });
    }
  });
}
