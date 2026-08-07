// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useContainerReveal',
  displayName: 'useContainerReveal',
  keywords: ['reveal', 'hover', 'focus', 'container', 'row', 'actions', 'overlay', 'conceal', 'hidden', 'show'],
  params: [
    {
      name: 'options',
      type: 'UseContainerRevealOptions',
      description: 'Configuration object for the reveal container. Optional.',
      required: false,
    },
    {
      name: 'options.isEnabled',
      type: 'boolean',
      description: 'When false the hook is inert: no marker is applied and content getters return no styles, so content is always shown. Lets a component gate reveal on its own prop (e.g. revealOn === "hover").',
      default: 'true',
      required: false,
    },
  ],
  returns: [
    {
      name: 'getContainerProps',
      type: '() => {className?: string; style?: CSSProperties}',
      description: 'Spread onto the container whose hover/focus-within drives the reveal.',
    },
    {
      name: 'getContentRevealProps',
      type: '(options?: ContentRevealOptions) => {className?: string; style?: CSSProperties}',
      description: 'Spread onto each revealed (or concealed) child. Accepts isRevealInverted to conceal-on-hover instead of reveal-on-hover, and isLayoutPreserved to reserve the layout box while hidden (opacity-only) and avoid layout shift.',
    },
  ],
  usage: {
    description:
      'A headless hover/focus reveal primitive. Gives a container a scoped trigger that reveals (or conceals) content inside it when the container is hovered or receives keyboard focus: the classic "row actions appear on hover" pattern. The reveal is CSS-only: no hover state lives in React and hovering never triggers a re-render. The caller authors no StyleX for the reveal itself; the hook hands out a scoped marker and matching styles, so nested containers never leak hover/focus into one another. Accessible by construction: revealed content is visually hidden at rest with position and opacity (never display:none), so it stays mounted, keeps its place in the tab order, and is announced to assistive technology; it reveals on :focus-within so keyboard users see it when tabbing in, stays visible on touch (never gated behind hover on coarse pointers), and honors prefers-reduced-motion.',
    bestPractices: [
      { guidance: true, description: 'Destructure getContainerProps and getContentRevealProps; spread getContainerProps() on the container (via mergeProps with your own stylex.props) and getContentRevealProps() on the content to reveal.' },
      { guidance: true, description: 'Use for secondary affordances: reveal-on-hover row actions (edit/copy/remove on list or table rows) and overlay controls on a card or media tile (e.g. Thumbnail\'s remove button).' },
      { guidance: true, description: 'Gate the reveal with isEnabled when a consumer prop decides whether content is revealed on hover or always shown.' },
      { guidance: true, description: 'Pass isLayoutPreserved for absolutely-positioned or overlay content to reserve its box and avoid layout shift when it appears.' },
      { guidance: false, description: 'Use it to hide content that must always be discoverable; keep essential actions visible instead of gating them behind hover.' },
    ],
  },
  relatedComponents: ['Thumbnail'],
  relatedHooks: ['useClickableContainer'],
  importPath: '@astryxdesign/core/hooks',
  category: 'interaction',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    'Headless hover/focus reveal primitive. Gives a container a scoped trigger that reveals (or conceals) content inside it on hover / keyboard focus: the "row actions appear on hover" pattern. CSS-only: no hover state in React, no re-render on hover. Caller authors no StyleX; hook hands out a scoped marker + matching styles, so nested containers never leak hover/focus. Accessible: revealed content visually hidden at rest via position + opacity (never display:none), stays mounted + in tab order + announced; reveals on :focus-within, stays visible on touch, honors prefers-reduced-motion.',
  paramDescriptions: {
    options: 'config for reveal container. optional.',
    'options.isEnabled': 'when false hook is inert: no marker, content getters return no styles, content always shown. Lets component gate reveal on its own prop.',
  },
  returnDescriptions: {
    getContainerProps: 'spread onto container whose hover/focus-within drives reveal.',
    getContentRevealProps: 'spread onto each revealed / concealed child. Accepts isRevealInverted (conceal-on-hover) + isLayoutPreserved (reserve layout box while hidden).',
  },
  usage: {
    description:
      'Headless hover/focus reveal primitive. Gives a container a scoped trigger that reveals (or conceals) content inside it on hover / keyboard focus: the "row actions appear on hover" pattern. CSS-only: no hover state in React, no re-render on hover. Caller authors no StyleX; hook hands out a scoped marker + matching styles, so nested containers never leak hover/focus. Accessible: revealed content visually hidden at rest via position + opacity (never display:none), stays mounted + in tab order + announced; reveals on :focus-within, stays visible on touch, honors prefers-reduced-motion.',
    bestPractices: [
      { guidance: true, description: 'Destructure getContainerProps + getContentRevealProps; spread getContainerProps() on container (via mergeProps w/ your stylex.props) + getContentRevealProps() on content to reveal.' },
      { guidance: true, description: 'Use for secondary affordances: reveal-on-hover row actions (edit/copy/remove on list / table rows) + overlay controls on card / media tile (e.g. Thumbnail remove button).' },
      { guidance: true, description: 'Gate reveal w/ isEnabled when a consumer prop decides revealed-on-hover vs always shown.' },
      { guidance: true, description: 'Pass isLayoutPreserved for absolutely-positioned / overlay content to reserve its box + avoid layout shift.' },
      { guidance: false, description: 'Use to hide content that must always be discoverable; keep essential actions visible instead of gating behind hover.' },
    ],
  },
};
