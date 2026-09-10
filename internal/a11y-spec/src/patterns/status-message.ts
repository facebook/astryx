// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file status-message.ts
 * @input Uses the shared accessibility contract vocabulary
 * @output STATUS_MESSAGE_PATTERN and the facts a binding declares for one status surface
 * @position Reusable WCAG 2.2 status-message contract
 */

import {
  definePattern,
  type PatternContract,
  type WcagCriterion,
  type WebStandardRequirement,
} from '../contract';

const UNDERSTANDING = 'https://www.w3.org/WAI/WCAG22/Understanding';
const ARIA = 'https://www.w3.org/TR/wai-aria-1.2';

const WCAG_4_1_2: WcagCriterion = {
  standard: 'wcag',
  id: '4.1.2',
  name: 'Name, Role, Value',
  level: 'A',
  url: `${UNDERSTANDING}/name-role-value.html`,
};

const WCAG_4_1_3: WcagCriterion = {
  standard: 'wcag',
  id: '4.1.3',
  name: 'Status Messages',
  level: 'AA',
  url: `${UNDERSTANDING}/status-messages.html`,
};

const ARIA_STATUS: WebStandardRequirement = {
  standard: 'web-standard',
  specification: 'WAI-ARIA 1.2 status role',
  requirement:
    'A status is a type of live region whose content is advisory information for the user but is not important enough to justify an alert.',
  url: `${ARIA}/#status`,
};

const ARIA_ALERT: WebStandardRequirement = {
  standard: 'web-standard',
  specification: 'WAI-ARIA 1.2 alert role',
  requirement:
    'Alerts are assertive live regions, which means they cause immediate notification for assistive technology users.',
  url: `${ARIA}/#alert`,
};

const WCAG_ARIA22: WebStandardRequirement = {
  standard: 'web-standard',
  specification: 'WCAG 2.2 Technique ARIA22',
  requirement:
    'The status container must be present in the DOM when the status message is displayed; the message is then added to or updated inside that container.',
  url: 'https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA22',
};

const ARIA_PROGRESSBAR: WebStandardRequirement = {
  standard: 'web-standard',
  specification: 'WAI-ARIA 1.2 progressbar role',
  requirement:
    'A progressbar is an element that displays the progress status for tasks that take a long time.',
  url: `${ARIA}/#progressbar`,
};

export type StatusMessageStateFacts =
  | {
      readonly kind: 'live-region';
      readonly politeness: 'polite' | 'assertive';
      readonly messageSource: 'text' | 'accessible-name';
      readonly message: string;
      readonly replacement: string;
      readonly canClear: boolean;
      readonly canRepeat: boolean;
    }
  | {
      readonly kind: 'progressbar';
      readonly politeness: null;
      readonly name: string;
      readonly progressValue: number;
      readonly completionValue: number;
      readonly maxValue: number;
    };

const LIVE_REGION = {
  condition: 'this binding uses a live region to expose the status message',
  test: (facts: StatusMessageStateFacts) => facts.kind === 'live-region',
};

const LIVE_TEXT_REGION = {
  condition:
    'this binding exposes status text inside a live region that it updates',
  test: (facts: StatusMessageStateFacts) =>
    facts.kind === 'live-region' && facts.messageSource === 'text',
};

const PROGRESSBAR = {
  condition: 'this binding exposes the status as a progress bar',
  test: (facts: StatusMessageStateFacts) => facts.kind === 'progressbar',
};

function normalizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

export const STATUS_MESSAGE_PATTERN: PatternContract<StatusMessageStateFacts> =
  definePattern<StatusMessageStateFacts>({
    pattern: 'status-message',
    url: `${UNDERSTANDING}/status-messages.html`,
    scope:
      'One status update that is programmatically exposed without moving focus; announcement output remains real-AT evidence.',
    expectations: [
      {
        id: 'status-message.channel.exposed',
        outcome:
          'The browser exposes the status through the intended polite or assertive live channel.',
        sources: [WCAG_4_1_3, ARIA_STATUS, ARIA_ALERT],
        covers: ['4.1.3-status-messages'],
        appliesWhen: LIVE_REGION,
        evidenceLayer: 'accessibility-tree',
        enforcement: 'required',
        run: async ({subject, facts}) => {
          const {live} = await subject.computed();
          if (live !== facts.politeness) {
            throw new Error(
              live == null
                ? `the browser exposes no live channel for this ${facts.politeness} status message, so assistive technology has no programmatic status update to present without moving focus`
                : `the browser exposes this status message through the ${live} channel, not the intended ${facts.politeness} channel`,
            );
          }
        },
      },
      {
        id: 'status-message.region.precedes-content',
        outcome:
          'The live region exists empty before the message occurs, then receives the complete status without being replaced.',
        sources: [WCAG_4_1_3, WCAG_ARIA22],
        covers: ['4.1.3-status-messages'],
        appliesWhen: LIVE_TEXT_REGION,
        evidenceLayer: 'dom',
        enforcement: 'required',
        run: async ({subject, facts, transition}) => {
          if (facts.kind !== 'live-region' || facts.messageSource !== 'text') {
            return;
          }
          const before = await subject.textContent();
          if (before !== '') {
            throw new Error(
              `the status region already contains ${JSON.stringify(before)} at the pre-update boundary, so it was mounted with its message instead of receiving the status as a later change`,
            );
          }
          await transition('show');
          if (!(await subject.isConnected())) {
            throw new Error(
              'the original empty status region was replaced when the message appeared, so the message did not update the region that preceded it',
            );
          }
        },
      },
      {
        id: 'status-message.region.precedes-named-message',
        outcome:
          'A named live region exists without a name before the status occurs, then receives the status name without being replaced.',
        sources: [WCAG_4_1_3, WCAG_ARIA22],
        covers: ['4.1.3-status-messages'],
        appliesWhen: {
          condition:
            'this binding exposes the status as the live region accessible name',
          test: facts =>
            facts.kind === 'live-region' &&
            facts.messageSource === 'accessible-name',
        },
        evidenceLayer: 'accessibility-tree',
        alsoNeeds: ['dom'],
        enforcement: 'required',
        run: async ({subject, facts, transition}) => {
          if (
            facts.kind !== 'live-region' ||
            facts.messageSource !== 'accessible-name'
          ) {
            return;
          }
          const before = (await subject.computed()).name.trim();
          if (before !== '') {
            throw new Error(
              `the named status region already has the accessible name ${JSON.stringify(before)} at the pre-update boundary, so it was mounted with its message instead of receiving the status as a later change`,
            );
          }
          await subject.isConnected();
          await transition('show');
          if (!(await subject.isConnected())) {
            throw new Error(
              'the original unnamed status region was replaced when its accessible name appeared, so the message did not update the region that preceded it',
            );
          }
        },
      },
      {
        id: 'status-message.message.text-exposed',
        outcome:
          'The complete status text appears inside the live region when the update occurs.',
        sources: [WCAG_4_1_3],
        covers: ['4.1.3-status-messages'],
        appliesWhen: LIVE_TEXT_REGION,
        evidenceLayer: 'dom',
        enforcement: 'required',
        run: async ({subject, facts, transition}) => {
          if (facts.kind !== 'live-region' || facts.messageSource !== 'text') {
            return;
          }
          await transition('show');
          const message = normalizeText(await subject.textContent());
          if (message !== normalizeText(facts.message)) {
            throw new Error(
              `after the status occurred, the live region contains ${JSON.stringify(message)} instead of the complete message ${JSON.stringify(normalizeText(facts.message))}`,
            );
          }
        },
      },
      {
        id: 'status-message.message.name-exposed',
        outcome:
          'The browser exposes the complete status as the live region’s accessible name when that is the chosen message channel.',
        sources: [WCAG_4_1_3],
        covers: ['4.1.3-status-messages'],
        appliesWhen: {
          condition:
            'this binding exposes the status as the live region accessible name',
          test: facts =>
            facts.kind === 'live-region' &&
            facts.messageSource === 'accessible-name',
        },
        evidenceLayer: 'accessibility-tree',
        enforcement: 'required',
        run: async ({subject, facts, transition}) => {
          if (
            facts.kind !== 'live-region' ||
            facts.messageSource !== 'accessible-name'
          ) {
            return;
          }
          await transition('show');
          const name = (await subject.computed()).name.trim();
          if (name !== facts.message.trim()) {
            throw new Error(
              `after the status occurred, the browser computes the live region name as ${JSON.stringify(name)} instead of ${JSON.stringify(facts.message.trim())}`,
            );
          }
        },
      },
      {
        id: 'status-message.region.atomic',
        outcome:
          'The whole status is exposed as one update, so partial text changes do not lose the context that gives them meaning.',
        sources: [WCAG_4_1_3, ARIA_STATUS, ARIA_ALERT],
        covers: ['4.1.3-status-messages'],
        appliesWhen: LIVE_REGION,
        evidenceLayer: 'accessibility-tree',
        enforcement: 'required',
        run: async ({subject}) => {
          const {atomic} = await subject.computed();
          if (atomic !== true) {
            throw new Error(
              'the browser does not expose this live region as atomic, so a partial text mutation can omit the context needed to understand the status',
            );
          }
        },
      },
      {
        id: 'status-message.message.replaced-in-place',
        outcome:
          'A later status replaces the earlier message inside the same live region.',
        sources: [WCAG_4_1_3],
        covers: ['4.1.3-status-messages'],
        appliesWhen: LIVE_TEXT_REGION,
        evidenceLayer: 'dom',
        enforcement: 'required',
        run: async ({subject, facts, transition}) => {
          if (facts.kind !== 'live-region' || facts.messageSource !== 'text') {
            return;
          }
          await subject.isConnected();
          await transition('show');
          await transition('replace');
          if (!(await subject.isConnected())) {
            throw new Error(
              'replacing the status also replaced its live-region node, so the later message was born in a new region instead of updating the existing one',
            );
          }
          const after = normalizeText(await subject.textContent());
          if (after !== normalizeText(facts.replacement)) {
            throw new Error(
              `after replacement, the live region contains ${JSON.stringify(after)} instead of the complete later status ${JSON.stringify(normalizeText(facts.replacement))}`,
            );
          }
        },
      },
      {
        id: 'status-message.message.cleared-in-place',
        outcome:
          'When the status is cleared, stale text leaves the same live region instead of remaining as the current programmatic status.',
        sources: [WCAG_4_1_3],
        covers: ['4.1.3-status-messages'],
        appliesWhen: {
          condition:
            'this binding owns clearing status text from its persistent live region',
          test: facts => facts.kind === 'live-region' && facts.canClear,
        },
        evidenceLayer: 'dom',
        enforcement: 'required',
        run: async ({subject, facts, transition}) => {
          if (
            facts.kind !== 'live-region' ||
            facts.messageSource !== 'text' ||
            !facts.canClear
          ) {
            return;
          }
          await transition('show');
          await transition('clear');
          if (!(await subject.isConnected())) {
            throw new Error(
              'clearing the status removed its live-region node, so a later message has no persistent channel to update',
            );
          }
          const after = normalizeText(await subject.textContent());
          if (after !== '') {
            throw new Error(
              `clearing the status left ${JSON.stringify(after)} in the live region, so stale text remains the current programmatic status`,
            );
          }
        },
      },
      {
        id: 'status-message.message.repeat-creates-change',
        outcome:
          'Repeating the same status creates a fresh content change instead of leaving an unchanged region that cannot signal a new event.',
        sources: [WCAG_4_1_3],
        covers: ['4.1.3-status-messages'],
        appliesWhen: {
          condition:
            'this binding exposes repeated occurrences of the same status',
          test: facts => facts.kind === 'live-region' && facts.canRepeat,
        },
        evidenceLayer: 'dom',
        enforcement: 'advisory',
        advisoryBecause:
          'A clear-and-reinsert DOM change is the mechanism this layer can prove; whether and when assistive technology announces the repetition remains real-AT evidence under AST-009.',
        run: async ({subject, facts, transition}) => {
          if (
            facts.kind !== 'live-region' ||
            facts.messageSource !== 'text' ||
            !facts.canRepeat
          ) {
            return;
          }
          await transition('show');
          const changes = (
            await subject.textChangesDuring(() => transition('repeat'))
          ).map(normalizeText);
          if (!(await subject.isConnected())) {
            throw new Error(
              'repeating the status replaced its live-region node instead of creating a new change inside the existing channel',
            );
          }
          if (
            !changes.includes('') ||
            changes.at(-1) !== normalizeText(facts.message)
          ) {
            throw new Error(
              `repeating ${JSON.stringify(normalizeText(facts.message))} produced text changes ${JSON.stringify(changes)}; the same words need an observable clear-and-reinsert DOM change before any real-AT repetition claim can be tested`,
            );
          }
        },
      },
      {
        id: 'status-message.focus.unchanged',
        outcome:
          'The status update leaves focus on the user’s current control instead of moving focus to the message.',
        sources: [WCAG_4_1_3],
        covers: [
          '4.1.3-status-messages',
          '2.4.3-focus-order',
          '3.2.2-on-input',
        ],
        appliesWhen: {
          condition:
            'the binding produces a status update without a context change',
          test: () => true,
        },
        evidenceLayer: 'real-browser',
        enforcement: 'required',
        run: async ({harness, subject, facts, transition}) => {
          const anchor = await harness.related('focus-anchor');
          await anchor.focus();
          if (!(await anchor.isFocused())) {
            throw new Error(
              'the binding focus anchor could not receive focus before the status transition, so this scenario does not prove the no-focus-change requirement',
            );
          }
          await transition(facts.kind === 'progressbar' ? 'progress' : 'show');
          if (!(await anchor.isFocused()) || (await subject.containsFocus())) {
            throw new Error(
              'the status update moved focus away from the user’s current control and into another context instead of remaining passive',
            );
          }
        },
      },
      {
        id: 'status-message.progress.role-exposed',
        outcome:
          'The browser exposes ongoing progress as a progress bar rather than as an unidentified visual change.',
        sources: [WCAG_4_1_3, WCAG_4_1_2, ARIA_PROGRESSBAR],
        covers: ['4.1.3-status-messages', '4.1.2-name-role-value'],
        appliesWhen: PROGRESSBAR,
        evidenceLayer: 'accessibility-tree',
        enforcement: 'required',
        run: async ({subject}) => {
          const {role} = await subject.computed();
          if (role !== 'progressbar') {
            throw new Error(
              role == null
                ? 'the browser exposes no role for this progress status, so assistive technology cannot identify the changing value as progress'
                : `the browser exposes this progress status as ${JSON.stringify(role)}, not as a progress bar`,
            );
          }
        },
      },
      {
        id: 'status-message.progress.name-exposed',
        outcome:
          'The progress status names the operation whose progress is changing.',
        sources: [WCAG_4_1_2, ARIA_PROGRESSBAR],
        covers: ['4.1.2-name-role-value', '2.4.6-headings-and-labels'],
        appliesWhen: PROGRESSBAR,
        evidenceLayer: 'accessibility-tree',
        enforcement: 'required',
        run: async ({subject, facts}) => {
          if (facts.kind !== 'progressbar') {
            return;
          }
          const {name} = await subject.computed();
          if (name.trim() === '') {
            throw new Error(
              'the browser computes no accessible name for this progress bar, so the changing value does not say which operation it belongs to',
            );
          }
          if (name.trim() !== facts.name.trim()) {
            throw new Error(
              `the browser computes the progress name as ${JSON.stringify(name.trim())}, not the binding’s declared operation ${JSON.stringify(facts.name.trim())}`,
            );
          }
        },
      },
      {
        id: 'status-message.progress.updates-in-place',
        outcome:
          'Indeterminate progress becomes determinate and reaches completion through value updates on the same progress bar.',
        sources: [WCAG_4_1_3, WCAG_4_1_2, ARIA_PROGRESSBAR],
        covers: ['4.1.3-status-messages', '4.1.2-name-role-value'],
        appliesWhen: PROGRESSBAR,
        evidenceLayer: 'accessibility-tree',
        alsoNeeds: ['dom'],
        enforcement: 'required',
        run: async ({subject, facts, transition}) => {
          if (facts.kind !== 'progressbar') {
            return;
          }
          const initial = await subject.computed();
          if (initial.rangeValue != null) {
            throw new Error(
              `the binding declares an indeterminate starting state, but the browser already exposes value ${initial.rangeValue}`,
            );
          }
          await subject.isConnected();
          await transition('progress');
          if (!(await subject.isConnected())) {
            throw new Error(
              'starting determinate progress replaced the progressbar node instead of updating the existing status surface',
            );
          }
          const progressing = await subject.computed();
          if (
            progressing.rangeValue !== facts.progressValue ||
            progressing.rangeMin !== 0 ||
            progressing.rangeMax !== facts.maxValue
          ) {
            throw new Error(
              `the browser exposes progress as value=${String(progressing.rangeValue)}, min=${String(progressing.rangeMin)}, max=${String(progressing.rangeMax)} instead of ${facts.progressValue} in 0..${facts.maxValue}`,
            );
          }
          await transition('complete');
          if (!(await subject.isConnected())) {
            throw new Error(
              'completing progress replaced the progressbar node instead of updating the existing status surface',
            );
          }
          const completed = await subject.computed();
          if (completed.rangeValue !== facts.completionValue) {
            throw new Error(
              `completion leaves the browser-exposed progress value at ${String(completed.rangeValue)} instead of ${facts.completionValue}`,
            );
          }
        },
      },
    ],
    exemptions: {
      '1.1.1-non-text-content': {
        owner: 'the binding component and caller content',
        verifiedBy:
          "the component's own decorative-icon and text-alternative tests plus the repository axe audit",
        reason:
          'This contract observes the status surface. A component or caller decides whether an icon carries information and supplies its alternative or hides it as redundant.',
      },
      '1.3.1-info-and-relationships': {
        owner: 'the binding component and composing feature',
        verifiedBy:
          "the component's relationship tests and integration review of any control or result the message describes",
        reason:
          'A live channel exposes the update, but the relationship between that update and nearby controls or results belongs to the composition that creates them.',
      },
      '1.3.2-meaningful-sequence': {
        owner: 'the composing page',
        verifiedBy: 'page-level DOM-order and reading-order review',
        reason:
          'The order of a status surface among surrounding content is decided by the page, not by one message in isolation.',
      },
      '1.3.5-identify-input-purpose': {
        owner: 'the composing form',
        verifiedBy:
          'form review for user-information inputs and their autocomplete purposes',
        reason:
          'A status message reports an outcome and does not collect user information.',
      },
      '1.4.1-use-of-color': {
        owner: 'the binding component and theme',
        verifiedBy:
          "the component's non-color-cue tests and the repository visual review",
        reason:
          'Color and any redundant visible icon are painted binding details that this semantic contract cannot observe.',
      },
      '1.4.3-contrast-minimum': {
        owner: 'the binding component and theme',
        verifiedBy:
          'the repository axe audit over component stories plus rendered visual review',
        reason:
          'Text contrast depends on resolved foreground, backdrop, theme, and state pixels.',
      },
      '1.4.11-non-text-contrast': {
        owner: 'the binding component and theme',
        verifiedBy:
          'the repository axe audit plus rendered visual review of meaningful indicators and progress graphics',
        reason:
          'The contrast of an icon, progress fill, track, or boundary is a rendered-pixel result outside this semantic contract.',
      },
      '2.1.1-keyboard': {
        owner: 'the binding component and composing page',
        verifiedBy:
          "the component's own tests for any controls placed beside or inside the status",
        reason:
          'The status surface is passive. Any dismiss, retry, or related action keeps its own button or link contract.',
      },
      '2.1.2-no-keyboard-trap': {
        owner: 'the binding component and composing page',
        verifiedBy:
          'keyboard review of any interactive content composed with the status',
        reason:
          'The status surface neither accepts nor traps focus; interactive descendants remain separate component contracts.',
      },
      '2.4.2-page-titled': {
        owner: 'the page',
        verifiedBy: 'page-level review',
        reason:
          'A component status update cannot provide or evaluate the document title.',
      },
      '2.4.3-focus-order': {
        owner: 'the composing page',
        verifiedBy:
          'page-level focus-order review; this contract proves only that producing the status leaves the current focus unchanged',
        reason:
          'The order of every focusable element around the status is a page property.',
        coversRemainderOnly: true,
      },
      '2.4.4-link-purpose': {
        owner: 'caller content and the link pattern',
        verifiedBy:
          'review of any link composed into or beside a visible status message',
        reason:
          'A status surface is not a link, and any linked recovery or follow-up action keeps its own contract.',
      },
      '2.4.6-headings-and-labels': {
        owner: 'caller content and the binding component',
        verifiedBy:
          'content review of the status wording; this contract proves only that a progress status has a name',
        reason:
          'Whether the supplied wording describes the operation or outcome well is a content judgement.',
        coversRemainderOnly: true,
      },
      '2.4.7-focus-visible': {
        owner: 'the currently focused control and its component',
        verifiedBy:
          'the focused component contract and rendered focus-indicator review',
        reason:
          'The status must not take focus. The control that keeps focus owns its visible indicator.',
      },
      '2.4.11-focus-not-obscured': {
        owner: 'the composing page and overlay system',
        verifiedBy: 'page-level and overlay visual review',
        reason:
          'Whether a newly rendered status covers the focused control depends on page layout and layering.',
      },
      '2.5.2-pointer-cancellation': {
        owner: 'any interactive control composed with the status',
        verifiedBy: "that control's pointer interaction contract",
        reason:
          'The status surface is passive and performs no single-pointer action.',
      },
      '2.5.3-label-in-name': {
        owner: 'interactive controls composed with the status',
        verifiedBy: "each control's visible-label and accessible-name contract",
        reason:
          'A passive status message is not a speech-input target. A related action remains a separate button or link.',
      },
      '2.5.8-target-size': {
        owner: 'interactive controls composed with the status and the page',
        verifiedBy:
          'the repository target-size audit over rendered controls and their neighbours',
        reason:
          'The status surface has no pointer target; related actions keep their own geometry.',
      },
      '3.1.1-language-of-page': {
        owner: 'the page',
        verifiedBy: 'page-level language review',
        reason:
          'A component status update cannot set or verify the document language.',
      },
      '3.2.2-on-input': {
        owner: 'the caller that causes the status update',
        verifiedBy:
          'integration review of any navigation, viewport, or meaning change caused by the caller',
        reason:
          'This contract proves that the status itself does not move focus. Any other context change comes from the action that produced it.',
        coversRemainderOnly: true,
      },
      '3.2.4-consistent-identification': {
        owner: 'the design system',
        verifiedBy:
          'this shared contract and review of every component binding to it',
        reason:
          'Consistency is a property of the complete set of status-message adopters, not one binding state.',
      },
      '3.3.1-error-identification': {
        owner: 'the field component and caller content',
        verifiedBy:
          "the field's error-state and textual-identification tests plus form review",
        reason:
          'This contract can expose an error message through an assertive channel, but the field owner decides which input is in error and whether the text identifies it.',
      },
      '3.3.2-labels-or-instructions': {
        owner: 'the composing form and caller content',
        verifiedBy: 'form-level review of labels and instructions',
        reason:
          'A status message reports an outcome; it does not provide the persistent label or instructions for an input.',
      },
      '4.1.2-name-role-value': {
        owner: 'the binding component',
        verifiedBy:
          "the component's own semantic contract for states outside the progress status represented here",
        reason:
          'This pattern encodes the progressbar role, name, and value updates. Other component state and value semantics remain with each adopted component pattern.',
        coversRemainderOnly: true,
      },
      '4.1.3-status-messages': {
        owner: 'the assistive-technology verification record, spec:AST-009',
        verifiedBy:
          'the named real-AT/browser matrix and durable receipts required by AST-009 when a change claims spoken or braille output, order, timing, repetition, or omission',
        reason:
          'This contract proves DOM lifecycle, browser exposure, and focus preservation only. It does not claim what assistive technology announces.',
        coversRemainderOnly: true,
      },
      'apg-interaction': {
        owner: 'no adopted APG widget pattern for status messages',
        verifiedBy:
          'WCAG 2.2 Status Messages and WAI-ARIA status, alert, and progressbar semantics cited by this contract',
        reason:
          'No current Astryx record adopts an APG widget interaction model for this passive status-message pattern, so the contract does not import one.',
      },
      'forced-colors': {
        owner: 'the binding component and theme',
        verifiedBy:
          "the component's forced-colors tests plus rendered Windows High Contrast review",
        reason:
          'Forced-color paint is outside the DOM and accessibility-tree observations in this contract.',
      },
      'reduced-motion': {
        owner: 'the binding component and theme',
        verifiedBy:
          "the component's reduced-motion source tests and rendered motion review",
        reason:
          'Spinner, typing, progress, and toast animation are visual timing behavior, not status-message semantics.',
      },
      'at-facing-strings': {
        owner: 'the binding component and caller content',
        verifiedBy:
          'the repository i18n catalog check plus source review of generated and caller-supplied status strings',
        reason:
          'The shared contract receives rendered messages and cannot tell whether their source was translated. Each component owns generated strings; callers own supplied content.',
      },
    },
  });
