// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file status-message.fixtures.ts
 * @input Uses the status-message binding facts
 * @output Plain-HTML conforming and deliberately violating fixtures, transition data, and mutation map
 * @position Contract self-test fixtures; no Astryx component is used here
 */

import type {StatusMessageStateFacts} from './status-message';

export const STATUS_MESSAGE_SUBJECT_SELECTOR = '[data-a11y-subject]';

export type StatusMessageTransition =
  'show' | 'replace' | 'clear' | 'repeat' | 'progress' | 'complete';

export interface StatusMessageFixtureTransition {
  readonly value?: string | null;
  readonly attribute?: 'aria-label' | 'aria-valuenow';
  readonly replaceSubject?: boolean;
  readonly pulse?: boolean;
  readonly focusSelector?: string;
}

export interface StatusMessageFixture {
  readonly id: string;
  readonly facts: StatusMessageStateFacts;
  readonly html: string;
  readonly transitions?: Readonly<
    Partial<Record<StatusMessageTransition, StatusMessageFixtureTransition>>
  >;
}

const POLITE_FACTS: StatusMessageStateFacts = {
  kind: 'live-region',
  politeness: 'polite',
  messageSource: 'text',
  message: 'Changes saved',
  replacement: 'Profile updated',
  canClear: true,
  canRepeat: true,
};

const ASSERTIVE_FACTS: StatusMessageStateFacts = {
  ...POLITE_FACTS,
  politeness: 'assertive',
  message: 'Upload failed',
  replacement: 'Connection failed',
};

const NAMED_FACTS: StatusMessageStateFacts = {
  ...POLITE_FACTS,
  messageSource: 'accessible-name',
  canClear: false,
  canRepeat: false,
};

const PROGRESS_FACTS: StatusMessageStateFacts = {
  kind: 'progressbar',
  politeness: null,
  name: 'Upload progress',
  progressValue: 40,
  completionValue: 100,
  maxValue: 100,
};

const POLITE_TRANSITIONS = {
  show: {value: 'Changes saved'},
  replace: {value: 'Profile updated'},
  clear: {value: ''},
  repeat: {value: 'Changes saved', pulse: true},
} as const;

export const STATUS_MESSAGE_FIXTURES: readonly StatusMessageFixture[] = [
  {
    id: 'conforming-polite-channel',
    facts: POLITE_FACTS,
    html: '<button data-a11y-relation="focus-anchor">Save</button><div data-a11y-subject role="status" aria-live="polite" aria-atomic="true"></div>',
    transitions: POLITE_TRANSITIONS,
  },
  {
    id: 'conforming-assertive-channel',
    facts: ASSERTIVE_FACTS,
    html: '<button data-a11y-relation="focus-anchor">Upload</button><div data-a11y-subject role="alert" aria-live="assertive" aria-atomic="true"></div>',
    transitions: {
      show: {value: 'Upload failed'},
      replace: {value: 'Connection failed'},
      clear: {value: ''},
      repeat: {value: 'Upload failed', pulse: true},
    },
  },
  {
    id: 'conforming-named-channel',
    facts: NAMED_FACTS,
    html: '<button data-a11y-relation="focus-anchor">Load</button><div data-a11y-subject role="status" aria-label=""></div>',
    transitions: {
      show: {attribute: 'aria-label', value: 'Changes saved'},
      replace: {attribute: 'aria-label', value: 'Profile updated'},
    },
  },
  {
    id: 'conforming-progress',
    facts: PROGRESS_FACTS,
    html: '<button data-a11y-relation="focus-anchor">Start upload</button><div data-a11y-subject role="progressbar" aria-label="Upload progress"></div>',
    transitions: {
      progress: {attribute: 'aria-valuenow', value: '40'},
      complete: {attribute: 'aria-valuenow', value: '100'},
    },
  },
  {
    id: 'violating-unexposed-channel',
    facts: POLITE_FACTS,
    html: '<div data-a11y-subject></div>',
  },
  {
    id: 'violating-wrong-channel',
    facts: ASSERTIVE_FACTS,
    html: '<div data-a11y-subject role="status"></div>',
  },
  {
    id: 'violating-born-with-content',
    facts: POLITE_FACTS,
    html: '<div data-a11y-subject role="status">Changes saved</div>',
    transitions: {show: {}},
  },
  {
    id: 'violating-missing-message',
    facts: POLITE_FACTS,
    html: '<div data-a11y-subject role="status"></div>',
    transitions: {show: {}},
  },
  {
    id: 'violating-non-atomic',
    facts: POLITE_FACTS,
    html: '<div data-a11y-subject aria-live="polite"></div>',
  },
  {
    id: 'violating-replaced-region',
    facts: POLITE_FACTS,
    html: '<div data-a11y-subject role="status"></div>',
    transitions: {
      show: {value: 'Changes saved'},
      replace: {value: 'Profile updated', replaceSubject: true},
    },
  },
  {
    id: 'violating-stale-clear',
    facts: POLITE_FACTS,
    html: '<div data-a11y-subject role="status"></div>',
    transitions: {
      show: {value: 'Changes saved'},
      clear: {},
    },
  },
  {
    id: 'violating-repeat-without-change',
    facts: POLITE_FACTS,
    html: '<div data-a11y-subject role="status"></div>',
    transitions: {
      show: {value: 'Changes saved'},
      repeat: {},
    },
  },
  {
    id: 'violating-named-born-with-content',
    facts: NAMED_FACTS,
    html: '<div data-a11y-subject role="status" aria-label="Changes saved"></div>',
    transitions: {show: {}},
  },
  {
    id: 'violating-named-never-updates',
    facts: NAMED_FACTS,
    html: '<div data-a11y-subject role="status" aria-label=""></div>',
    transitions: {show: {}},
  },
  {
    id: 'violating-moves-focus',
    facts: POLITE_FACTS,
    html: '<button data-a11y-relation="focus-anchor">Save</button><div data-a11y-subject role="status" tabindex="-1"></div>',
    transitions: {
      show: {
        value: 'Changes saved',
        focusSelector: STATUS_MESSAGE_SUBJECT_SELECTOR,
      },
    },
  },
  {
    id: 'violating-progress-role',
    facts: PROGRESS_FACTS,
    html: '<div data-a11y-subject aria-label="Upload progress"></div>',
  },
  {
    id: 'violating-progress-name',
    facts: PROGRESS_FACTS,
    html: '<div data-a11y-subject role="progressbar"></div>',
  },
  {
    id: 'violating-frozen-progress',
    facts: PROGRESS_FACTS,
    html: '<button data-a11y-relation="focus-anchor">Start upload</button><div data-a11y-subject role="progressbar" aria-label="Upload progress"></div>',
    transitions: {progress: {}, complete: {}},
  },
];

export const STATUS_MESSAGE_CONFORMING_FIXTURES = [
  'conforming-polite-channel',
  'conforming-assertive-channel',
  'conforming-named-channel',
  'conforming-progress',
] as const;

export const STATUS_MESSAGE_MUTATIONS: Readonly<
  Record<string, readonly string[]>
> = {
  'status-message.channel.exposed': [
    'violating-unexposed-channel',
    'violating-wrong-channel',
  ],
  'status-message.region.precedes-content': ['violating-born-with-content'],
  'status-message.message.text-exposed': ['violating-missing-message'],
  'status-message.region.precedes-named-message': [
    'violating-named-born-with-content',
  ],
  'status-message.message.name-exposed': ['violating-named-never-updates'],
  'status-message.region.atomic': ['violating-non-atomic'],
  'status-message.message.replaced-in-place': ['violating-replaced-region'],
  'status-message.message.cleared-in-place': ['violating-stale-clear'],
  'status-message.message.repeat-creates-change': [
    'violating-repeat-without-change',
  ],
  'status-message.focus.unchanged': ['violating-moves-focus'],
  'status-message.progress.role-exposed': ['violating-progress-role'],
  'status-message.progress.name-exposed': ['violating-progress-name'],
  'status-message.progress.updates-in-place': ['violating-frozen-progress'],
};

export function statusMessageFixture(id: string): StatusMessageFixture {
  const found = STATUS_MESSAGE_FIXTURES.find(candidate => candidate.id === id);
  if (found == null) {
    throw new Error(`unknown status-message fixture "${id}"`);
  }
  return found;
}
