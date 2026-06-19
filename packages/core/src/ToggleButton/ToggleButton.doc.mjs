// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'ToggleButton',
  displayName: 'Toggle Button',
  group: 'Button',
  category: 'Action',
  keywords: ["toggle","togglebutton","pressed","toolbar","formatting","segmented","button-group","exclusive","multi-select"],
  playground: {
    defaults: {
      value: 'option-1',
      label: 'Toggle Group',
    },
  },
  theming: {
    targets: [
      {className: 'xds-toggle-button-group'},
    ],
  },
  description: 'A button that toggles between pressed and unpressed states. Thin wrapper over XDSButton with controlled toggle pattern, icon swap, and font weight emphasis.',
  props: [
    {
      name: 'label',
      type: 'string',
      description: 'Accessible label for the button. Used as visible text, or as aria-label for icon-only buttons.',
      required: true,
    },
    {
      name: 'isPressed',
      type: 'boolean',
      description: 'Whether the button is currently pressed. Ignored when inside a group.',
    },
    {
      name: 'onPressedChange',
      type: '(isPressed: boolean) => void',
      description: 'Called when pressed state should change. Ignored when inside a group.',
    },
    {
      name: 'pressedChangeAction',
      type: '(isPressed: boolean) => Promise<void>',
      description: 'Async action handler for API-backed toggles. Shows loading spinner while pending.',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: 'Button size. Defaults to group size when inside a group.',
      default: "'md'",
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Whether the button is disabled.',
      default: 'false',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description: 'Whether the button shows a loading spinner.',
      default: 'false',
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description: 'Icon element. When provided without children, button becomes icon-only with tooltip from label.',
      slotElements: [
        {
          __element: 'XDSIcon',
          props: {
            icon: 'check',
            size: 'sm',
          },
        },
      ],
    },
    {
      name: 'pressedIcon',
      type: 'ReactNode',
      description: 'Icon shown when pressed. Falls back to icon if not provided.',
      slotElements: [
        {
          __element: 'XDSIcon',
          props: {
            icon: 'check',
            size: 'sm',
          },
        },
      ],
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Visible content. If omitted with icon, button becomes icon-only.',
    },
    {
      name: 'tooltip',
      type: 'string',
      description: 'Tooltip text shown on hover.',
    },
    {
      name: 'value',
      type: 'string',
      description: 'Value identifier when used inside XDSToggleButtonGroup. Required in groups.',
    },
    {
      name: 'data-testid',
      type: 'string',
      description: 'Test selector for automated testing frameworks.',
    },
  ],
  components: [
    {name: 'XDSToggleButtonGroup'},
  ],
  usage: {
    description:
      'ToggleButton switches between selected and unselected states to represent a persistent on/off choice. Use it standalone for binary actions like bold, mute, or favorite, or inside a ToggleButtonGroup for single-select or multi-select toolbar controls.',
    bestPractices: [
      {guidance: true, description: 'Use a filled or colored icon for the pressed state so users can see the current state at a glance: an outline star vs a solid star, for example.'},
      {guidance: true, description: 'Keep the label identical between pressed and unpressed states. Let the visual treatment (icon, weight, background) communicate the change.'},
      {guidance: true, description: 'Wrap related toggles in a ToggleButtonGroup with an accessible label so screen readers announce them as a connected set.'},
      {guidance: false, description: "Don't use a ToggleButton for one-time actions like \"Submit\" or \"Delete\"; those are regular Buttons, not toggles."},
      {guidance: false, description: "Don't mix ToggleButtons with regular Buttons inside the same group; use only ToggleButtons in a ToggleButtonGroup."},
      {guidance: false, description: "Don't use a ToggleButton for on/off settings that persist across sessions; use a Switch instead, which better communicates \"setting\" semantics."},
    ],
    anatomy: [
      {name: 'Icon', required: false, description: 'A leading icon that represents the toggle action, like a star for favorite or bold "B" for formatting.'},
      {name: 'Pressed icon', required: false, description: 'An alternate icon shown when pressed: typically a filled version of the default icon to reinforce the active state.'},
      {name: 'Label', required: true, description: 'The visible text or accessible name. For icon-only toggles, used as the aria-label and auto-tooltip.'},
      {name: 'Spinner', required: false, description: 'Replaces the icon during async operations triggered by pressedChangeAction.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsZh = {
  usage: {
    description:
      'ToggleButton switches between selected and unselected states to represent a persistent on/off choice. Use it standalone for binary actions like bold, mute, or favorite, or inside a ToggleButtonGroup for single-select or multi-select toolbar controls.',
    bestPractices: [
      {guidance: true, description: 'Use a filled or colored icon for the pressed state so users can see the current state at a glance: an outline star vs a solid star, for example.'},
      {guidance: true, description: 'Keep the label identical between pressed and unpressed states. Let the visual treatment (icon, weight, background) communicate the change.'},
      {guidance: true, description: 'Wrap related toggles in a ToggleButtonGroup with an accessible label so screen readers announce them as a connected set.'},
      {guidance: false, description: "Don't use a ToggleButton for one-time actions like \"Submit\" or \"Delete\"; those are regular Buttons, not toggles."},
      {guidance: false, description: "Don't mix ToggleButtons with regular Buttons inside the same group; use only ToggleButtons in a ToggleButtonGroup."},
      {guidance: false, description: "Don't use a ToggleButton for on/off settings that persist across sessions; use a Switch instead, which better communicates \"setting\" semantics."},
    ],
    anatomy: [
      {name: 'Icon', required: false, description: 'A leading icon that represents the toggle action, like a star for favorite or bold "B" for formatting.'},
      {name: 'Pressed icon', required: false, description: 'An alternate icon shown when pressed: typically a filled version of the default icon to reinforce the active state.'},
      {name: 'Label', required: true, description: 'The visible text or accessible name. For icon-only toggles, used as the aria-label and auto-tooltip.'},
      {name: 'Spinner', required: false, description: 'Replaces the icon during async operations triggered by pressedChangeAction.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'toggle btn w/ pressed/unpressed states, icon swap, group integration for single/multi-select',
  usage: {
    description:
      'ToggleButton switches between selected/unselected for persistent on/off choices. Standalone for binary actions or in ToggleButtonGroup for single/multi-select toolbar controls.',
    bestPractices: [
      {guidance: true, description: 'Filled/colored icon for pressed state so users see current state at a glance.'},
      {guidance: true, description: 'Keep label identical between states. Let visual treatment communicate the change.'},
      {guidance: true, description: 'Wrap related toggles in ToggleButtonGroup with accessible label.'},
      {guidance: false, description: "Don't use ToggleButton for one-time actions; use regular Button for submit/delete."},
      {guidance: false, description: "Don't mix ToggleButtons with regular Buttons in the same group."},
      {guidance: false, description: "Don't use ToggleButton for persistent settings; use Switch instead."},
    ],
  },
};
