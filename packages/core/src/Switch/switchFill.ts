// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file switchFill.ts
 * @input Switch's track element and the props its other state renders with
 * @output Exports TrackState, trackStateOf, readInState and readFillOf: an
 *   element read in its other state (the track's fill as the theme paints
 *   it, the thumb's place), in place
 * @position Shared by Switch.tsx and useSwitchTouch.ts for the colour fade
 *   under a finger
 *
 * Under a finger the track keeps its own fill in both states, so a theme's
 * `switch` target paints it as it does under a mouse, and a layer over it
 * fades the outgoing fill out (or, mid-drag, the coming one in) on the
 * compositor. That layer needs the fill of the state the track is not in,
 * whatever the theme makes it: readFillOf swaps the track to that state's
 * class and attributes, reads the computed colour and swaps back in the same
 * task, so nothing paints in between and the theme stays the one source.
 *
 * SYNC: When modified, update Switch.tsx and useSwitchTouch.ts.
 */

/** A track state: its class name and its data attributes. */
export interface TrackState {
  readonly className: string;
  readonly attributes: Readonly<Record<string, string>>;
}

/** The track state of rendered props (`className` and `data-*` props). */
export function trackStateOf(props: object): TrackState {
  const attributes: Record<string, string> = {};
  let className = '';
  for (const [name, value] of Object.entries(props)) {
    if (name === 'className' && typeof value === 'string') {
      className = value;
    } else if (name.startsWith('data-') && value != null && value !== false) {
      attributes[name] = String(value);
    }
  }
  return {className, attributes};
}

/**
 * Reads `element` as it renders in `state` (its class and data attributes),
 * swapping them in and back in the same task, so nothing paints between.
 */
export function readInState<T>(
  element: HTMLElement,
  state: TrackState,
  read: (element: HTMLElement) => T,
): T {
  const names = new Set(Object.keys(state.attributes));
  for (const attribute of Array.from(element.attributes)) {
    if (attribute.name.startsWith('data-')) {
      names.add(attribute.name);
    }
  }
  const savedClass = element.className;
  const saved = new Map<string, string | null>();
  for (const name of names) {
    saved.set(name, element.getAttribute(name));
  }
  const apply = (
    className: string,
    valueOf: (name: string) => string | null,
  ) => {
    element.className = className;
    for (const name of names) {
      const value = valueOf(name);
      if (value == null) {
        element.removeAttribute(name);
      } else {
        element.setAttribute(name, value);
      }
    }
  };
  apply(state.className, name => state.attributes[name] ?? null);
  try {
    return read(element);
  } finally {
    apply(savedClass, name => saved.get(name) ?? null);
  }
}

/** The track's computed fill in `state`, read without a paint. */
export function readFillOf(track: HTMLElement, state: TrackState): string {
  return readInState(
    track,
    state,
    element => getComputedStyle(element).backgroundColor,
  );
}
