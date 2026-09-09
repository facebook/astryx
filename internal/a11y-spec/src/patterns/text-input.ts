// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file text-input.ts
 * @input Uses ../contract (definePattern and the expectation vocabulary)
 * @output TEXT_INPUT_PATTERN — the native text-input pattern contract — and
 *   TextInputStateFacts, what a binding declares each rendered state should expose
 * @position Shared accessibility contract for native single-line and multi-line
 *   text controls; component-specific callbacks, form behavior, composition,
 *   styling, and announcement behavior stay with each binding component.
 */

import {
  definePattern,
  type PatternContract,
  type WcagCriterion,
  type WebStandardRequirement,
} from '../contract';

const WCAG_4_1_2: WcagCriterion = {
  standard: 'wcag',
  id: '4.1.2',
  name: 'Name, Role, Value',
  level: 'A',
  url: 'https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html',
};

const HTML_AAM_INPUT_TEXTBOX: WebStandardRequirement = {
  standard: 'web-standard',
  specification: 'HTML Accessibility API Mappings 1.0',
  requirement:
    'input type text, password, email, tel, and url map to the textbox role.',
  url: 'https://www.w3.org/TR/html-aam-1.0/#el-input-text',
};

const HTML_AAM_TEXTAREA: WebStandardRequirement = {
  standard: 'web-standard',
  specification: 'HTML Accessibility API Mappings 1.0',
  requirement: 'textarea maps to the textbox role.',
  url: 'https://www.w3.org/TR/html-aam-1.0/#el-textarea',
};

const ALWAYS = {
  condition: 'the binding renders a native text control',
  test: () => true,
};

export interface TextInputStateFacts {
  readonly multiline: boolean;
  readonly value: string | null;
  readonly editable: boolean;
  readonly focusable: boolean;
  readonly disabled: boolean;
  readonly readOnly: boolean;
  readonly required: boolean;
  readonly invalid: boolean;
  readonly description: string | null;
  readonly errorMessage: string | null;
}

export const TEXT_INPUT_PATTERN: PatternContract<TextInputStateFacts> =
  definePattern<TextInputStateFacts>({
    pattern: 'text-input',
    url: 'https://www.w3.org/TR/wai-aria-1.2/#textbox',
    scope:
      'One native single-line or multi-line text control whose role, name, value, state, supporting text, focus, and editing behavior remain available to the user.',
    expectations: [
      {
        id: 'text-input.role.exposed',
        outcome:
          'The browser exposes the control as a textbox, so the user knows it accepts text.',
        sources: [WCAG_4_1_2, HTML_AAM_INPUT_TEXTBOX, HTML_AAM_TEXTAREA],
        covers: ['4.1.2-name-role-value'],
        appliesWhen: ALWAYS,
        evidenceLayer: 'accessibility-tree',
        enforcement: 'required',
        run: async ({subject}) => {
          const {role} = await subject.computed();
          if (role !== 'textbox') {
            throw new Error(
              role == null
                ? 'the browser exposes no role for this native text control, so the accessibility node does not identify what kind of input it is'
                : `the browser reports this native text control as "${role}", not as a textbox`,
            );
          }
        },
      },
    ],
    exemptions: {
      '1.1.1-non-text-content': {
        owner: 'the binding component',
        verifiedBy:
          "the component's own icon and spinner tests plus the repository axe audit, `pnpm a11y:audit`",
        reason:
          'Decorative and informative graphics are composed around the native text control, not exposed by the control node this pattern observes.',
      },
      '1.3.1-info-and-relationships': {
        owner: 'the binding component',
        verifiedBy:
          "the component's own label, description, status, and counter relationship tests",
        reason:
          'Until the shared description expectation is authored, each binding retains the exact DOM relationship checks for its supporting content.',
      },
      '1.3.2-meaningful-sequence': {
        owner: 'the binding component and composing page',
        verifiedBy: 'component DOM-order tests and page-level review',
        reason:
          'Reading order includes labels, instructions, status content, and surrounding page content outside one native control node.',
      },
      '1.4.1-use-of-color': {
        owner: 'the binding component and theme',
        verifiedBy: 'component status tests and the repository visual gate',
        reason:
          'Whether status is distinguishable without color is a rendered composition and pixel outcome, not a native control-node semantic.',
      },
      '1.4.3-contrast-minimum': {
        owner: 'the binding component and theme',
        verifiedBy:
          'the repository axe audit over component stories plus the visual gate',
        reason:
          'Text contrast depends on resolved colors and backdrop pixels outside this semantic contract.',
      },
      '1.4.11-non-text-contrast': {
        owner: 'the binding component and theme',
        verifiedBy:
          'the repository axe audit over component stories plus the visual gate',
        reason:
          'Control boundaries, status icons, and focus indicators are painted surfaces outside this semantic contract.',
      },
      '2.1.1-keyboard': {
        owner: 'the binding component',
        verifiedBy: "the component's own editing tests",
        reason:
          'Until the shared editing expectation is authored, each native control keeps its keyboard-editing evidence locally.',
      },
      '2.1.2-no-keyboard-trap': {
        owner: 'the binding component and composing page',
        verifiedBy: 'component focus tests and page-level keyboard review',
        reason:
          'Until the shared focus expectation is authored, the binding and page retain focus-entry and exit evidence.',
      },
      '2.4.2-page-titled': {
        owner: 'the page',
        verifiedBy: 'page-level review and the hosting application',
        reason: 'An isolated text control cannot supply the document title.',
      },
      '2.4.3-focus-order': {
        owner: 'the composing page',
        verifiedBy: 'page-level keyboard review',
        reason:
          'Sequential order is a property of all focus stops a page composes, not one text control.',
      },
      '2.4.4-link-purpose': {
        owner: 'caller content',
        verifiedBy: 'review of any link composed near the field',
        reason: 'The native text-input pattern has no link part.',
      },
      '2.4.6-headings-and-labels': {
        owner: 'caller content and component review',
        verifiedBy:
          'content review of whether each supplied label describes the field purpose',
        reason:
          'Whether label wording describes its purpose is a content judgement no runtime check can settle.',
      },
      '2.4.7-focus-visible': {
        owner:
          'the interaction-modality architecture record and binding component',
        verifiedBy:
          "the component's focus-ring styling tests and the repository visual gate",
        reason:
          'A visible focus indicator is a paint result owned by the rendered component and theme.',
      },
      '2.4.11-focus-not-obscured': {
        owner: 'the composing page',
        verifiedBy: 'page-level and overlay review',
        reason:
          'Whether author-created content obscures a focused field depends on the page composition.',
      },
      '2.5.2-pointer-cancellation': {
        owner: 'the binding component and browser',
        verifiedBy:
          'component pointer tests for component-owned actions and native-browser behavior for caret placement',
        reason:
          'The text control itself has no component-owned single-pointer action; clear and tooltip buttons are separate bound patterns.',
      },
      '2.5.3-label-in-name': {
        owner: 'the binding component',
        verifiedBy:
          'real-browser comparison of visible label and computed name',
        reason:
          'Until the shared visible-label expectation is authored, each binding retains this comparison.',
      },
      '2.5.8-target-size': {
        owner: 'the binding component and composing page',
        verifiedBy:
          'real-browser geometry measurement plus review of applicable WCAG exceptions',
        reason:
          'Target size and spacing depend on rendered geometry and neighbouring targets outside the control node.',
      },
      '3.1.1-language-of-page': {
        owner: 'the page',
        verifiedBy: 'page-level review and the hosting application',
        reason: 'An isolated text control cannot supply the document language.',
      },
      '3.2.2-on-input': {
        owner: 'the caller',
        verifiedBy:
          'integration review of context changes performed by consumer callbacks',
        reason:
          'TextInput and TextArea report value changes; the caller decides whether those changes navigate or replace surrounding content.',
      },
      '3.2.4-consistent-identification': {
        owner: 'the composing application and caller content',
        verifiedBy:
          'cross-page review that equivalent fields use consistent names and identification',
        reason:
          'One isolated binding cannot compare equivalent functions across pages or workflows.',
      },
      '3.3.1-error-identification': {
        owner: 'the binding component and caller',
        verifiedBy: "the component's own validation-message tests",
        reason:
          'Until the shared error-text expectation is authored, bindings retain proof that detected errors are described in text.',
      },
      '3.3.2-labels-or-instructions': {
        owner: 'the binding component and caller content',
        verifiedBy:
          'component label tests and content review of needed instructions',
        reason:
          'Until the shared naming and description expectations are authored, the binding retains label association and the caller owns instruction wording.',
      },
      '4.1.2-name-role-value': {
        owner: 'the binding component and later expectations in this contract',
        verifiedBy:
          'the accessibility-tree role expectation here, plus component tests until the remaining shared name, value, and state expectations are authored',
        reason:
          'The role is encoded here. Name, value, and state exposure remain with each binding until their vertical slices are added to this contract.',
        coversRemainderOnly: true,
      },
      '4.1.3-status-messages': {
        owner:
          'the binding component and the assistive-technology verification record',
        verifiedBy:
          "the component's live-region regression tests plus real-AT evidence under `docs/specs/AST-009/spec.md` whenever a change claims what is announced",
        reason:
          'This pattern can verify static descriptions and state exposure, not speech, timing, repetition, or announcement order.',
      },
      'apg-interaction': {
        owner: 'a future current pattern owner, if Astryx adopts one',
        verifiedBy:
          'review against current Astryx records before adding any APG-derived mechanic',
        reason:
          'WAI-ARIA APG publishes no generic text-input widget pattern, and current Astryx authority adopts no substitute APG interaction model for native text controls.',
      },
      'forced-colors': {
        owner: 'the binding component and theme',
        verifiedBy:
          "the component's compiled-CSS tests plus manual Windows High Contrast review",
        reason:
          'Forced-colors behavior is a paint result outside this semantic contract.',
      },
      'reduced-motion': {
        owner: 'the binding component and theme',
        verifiedBy:
          'review of transition declarations and repository reduced-motion checks',
        reason:
          'Motion is a rendered result over time, and the native editing contract introduces none.',
      },
      'at-facing-strings': {
        owner: 'the binding component',
        verifiedBy:
          'the repository i18n catalog check and source review of assistive-technology-facing text',
        reason:
          'Translation is a source-level concern that the rendered semantic result cannot identify.',
      },
    },
  });
