// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'SearchField',
  displayName: 'Search Field',
  category: 'Form Controls',
  keywords: [
    'search',
    'search field',
    'search bar',
    'searchbar',
    'search controller',
    'mobile search',
    'cancel',
    'clear',
  ],
  description:
    "The search field of a phone app, as on iOS 26: a rounded field with a magnifier that, once tapped, narrows to make room for a glass close button and can rise into its host's bar. Under a finger it activates and cancels on the clock iOS uses; under a mouse its parts take their places at once. Its keyboard shows a Search key and does not autocorrect. Experimental: lands in lab first.",
  components: [
    {
      name: 'SearchField',
      displayName: 'Search Field',
      description:
        'The field. Tapping it activates search; the close button (or Escape) cancels: it clears the query, ends editing and returns to rest. A tap elsewhere ends editing but leaves search active, as on iOS.',
      props: [
        {
          name: 'label',
          type: 'string',
          description:
            "The field's accessible name, and its placeholder unless placeholder is set.",
          required: true,
        },
        {
          name: 'placeholder',
          type: 'string',
          description: 'Placeholder text. Defaults to label.',
        },
        {
          name: 'value',
          type: 'string',
          description: 'The query, for a controlled field. Pair with onChange.',
        },
        {
          name: 'defaultValue',
          type: 'string',
          description: 'The initial query, for an uncontrolled field.',
        },
        {
          name: 'onChange',
          type: '(value: string) => void',
          description:
            'Called with the query on every edit, and with an empty string when it is cleared or search is cancelled.',
        },
        {
          name: 'isActive',
          type: 'boolean',
          description:
            'Whether search is active, for a controlled field. Pair with onActiveChange.',
        },
        {
          name: 'defaultIsActive',
          type: 'boolean',
          description:
            'Whether search starts active, for an uncontrolled field.',
        },
        {
          name: 'onActiveChange',
          type: '(isActive: boolean) => void',
          description:
            'Called with true when the field gains focus and with false when search is cancelled.',
        },
        {
          name: 'onSubmit',
          type: '(value: string) => void',
          description:
            "Called with the query when the keyboard's Search key (Enter) is pressed. Focus and the keyboard stay; blur the field yourself if results should take over the screen.",
        },
        {
          name: 'handleRef',
          type: 'Ref<SearchFieldHandle>',
          description:
            "focus() and blur() for a host that activates the field from its own tap, such as a tab bar's search tab. Call focus() inside that tap, after committing the activation, so the touch keyboard rises.",
        },
        {
          name: 'lift',
          type: 'number',
          description:
            "How far the active field rises into its host's bar, in px. A navigation bar passes the distance from under its large title to its own row. Defaults to 0: the field stays in place.",
        },
        {
          name: 'cancelLabel',
          type: 'string',
          description:
            "The close button's accessible name. Defaults to Cancel.",
        },
        {
          name: 'clearLabel',
          type: 'string',
          description:
            "The clear button's accessible name. Defaults to Clear text.",
        },
      ],
    },
  ],
  usage: {
    description:
      'Use SearchField at the top of a phone screen whose content can be searched, such as a list. Filter the content as the query changes, and restore it when search is cancelled.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Give it a short label that says what is searched, such as "Search messages".',
      },
      {
        guidance: true,
        description:
          'Keep the results on screen while search is active; a tap on them ends editing without cancelling the search.',
      },
      {
        guidance: false,
        description:
          "Don't use it to pick one value from a known list (use Typeahead or a Selector with search) or for a command launcher (use CommandPalette).",
      },
    ],
  },
};
