/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'TextArea',
  description:
    'A multi-line text input component for collecting longer user input.',
  features: [
    'Label support — required label for accessibility, can be visually hidden',
    'Description — optional text displayed between the label and textarea',
    'Optional/Required indicators — displays "Optional" or "Required" text with bullet separator',
    'Status variants — warning, error, and success states with colored borders and icons',
    'Character counter — displays current/max length when maxLength is set',
    'Start icon — optional icon rendered inside the leading edge of the input',
    'Label tooltip — optional info icon with tooltip at the end of the label',
    'Loading state — shows a spinner and uses optimistic updates via useOptimistic',
    'Async action support — onChangeAction fires after onChange inside a React transition',
    'Disabled state — visual opacity and cursor changes, no interaction',
    'Accessible — label associated via htmlFor/id, aria-describedby, aria-required, aria-invalid, aria-busy',
    'Resizable — vertical resize enabled by default with a minimum height of 80px',
    'Spell check — browser spell checking enabled by default, configurable',
  ],
  examples: [
    {
      label: 'Basic',
      code: '<XDSTextArea label="Description" value={description} onChange={setDescription} />',
    },
    {
      label: 'With placeholder and custom rows',
      code: '<XDSTextArea label="Notes" rows={5} value={notes} onChange={setNotes} placeholder="Enter your notes..." />',
    },
    {
      label: 'Hidden label',
      code: '<XDSTextArea label="Comments" isLabelHidden value={comments} onChange={setComments} placeholder="Add a comment..." />',
    },
    {
      label: 'With description and optional indicator',
      code: '<XDSTextArea label="Bio" description="Tell us about yourself" isOptional value={bio} onChange={setBio} />',
    },
    {
      label: 'Error status with message',
      code: `<XDSTextArea
  label="Feedback"
  isRequired
  value={feedback}
  onChange={setFeedback}
  status={{type: 'error', message: 'Feedback is required'}}
/>`,
    },
    {
      label: 'With character counter',
      code: '<XDSTextArea label="Summary" maxLength={280} value={summary} onChange={setSummary} />',
    },
    {
      label: 'Disabled',
      code: '<XDSTextArea label="Read-only notes" isDisabled value="Cannot edit this" onChange={() => {}} />',
    },
  ],
  props: [
    {
      name: 'label',
      type: 'string',
      description:
        'Label text for the textarea — always rendered for accessibility.',
      required: true,
    },
    {
      name: 'value',
      type: 'string',
      description: 'Current value of the textarea.',
      required: true,
    },
    {
      name: 'onChange',
      type: '(value: string, e: ChangeEvent<HTMLTextAreaElement>) => void',
      description: 'Callback fired when the textarea value changes.',
    },
    {
      name: 'onChangeAction',
      type: '(value: string, e: ChangeEvent<HTMLTextAreaElement>) => void | Promise<void>',
      description:
        'Async action fired after onChange inside a React transition. Enables optimistic updates via useOptimistic.',
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description:
        'Visually hides the label while keeping it accessible to screen readers.',
      default: 'false',
    },
    {
      name: 'description',
      type: 'string',
      description: 'Helper text displayed between the label and textarea.',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description:
        'Displays an "Optional" indicator next to the label. Mutually exclusive with isRequired.',
      default: 'false',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description:
        'Displays a "Required" indicator next to the label and sets aria-required. Mutually exclusive with isOptional.',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Disables the textarea, preventing interaction.',
      default: 'false',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description:
        'Puts the textarea in a loading state, showing a spinner inside the input.',
      default: 'false',
    },
    {
      name: 'placeholder',
      type: 'string',
      description: 'Placeholder text shown when the textarea is empty.',
    },
    {
      name: 'rows',
      type: 'number',
      description: 'Number of visible text rows.',
      default: '3',
    },
    {
      name: 'maxLength',
      type: 'number',
      description:
        'Maximum number of characters allowed. When set, a character counter (current/max) is displayed below the textarea.',
    },
    {
      name: 'status',
      type: "{ type: 'warning' | 'error' | 'success'; message?: string }",
      description:
        'Status indicator that applies a colored border and icon. An optional message is displayed in a floating box below the textarea.',
    },
    {
      name: 'labelTooltip',
      type: 'string',
      description:
        'Tooltip text displayed in an info icon at the end of the label.',
    },
    {
      name: 'startIcon',
      type: 'XDSIconType',
      description:
        'Icon component rendered inside the leading edge of the textarea wrapper.',
    },
    {
      name: 'hasSpellCheck',
      type: 'boolean',
      description: 'Enables or disables browser spell checking.',
      default: 'true',
    },
    {
      name: 'hasAutoFocus',
      type: 'boolean',
      description: 'Automatically focuses the textarea on mount.',
      default: 'false',
    },
    {
      name: 'onPaste',
      type: '(e: ClipboardEvent<HTMLTextAreaElement>) => void',
      description: 'Callback fired when content is pasted into the textarea.',
    },
    {
      name: 'htmlName',
      type: 'string',
      description:
        'HTML name attribute for the textarea element, useful for form submissions.',
    },
  ],
  theming: {
    targets: [
      {className: 'xds-text-input', visualProps: ['size']},
    ],
  },
  accessibility: [
    'Label is always rendered in the DOM; use isLabelHidden to hide it visually while keeping it accessible.',
    'The textarea id is generated via useId and linked to its label via htmlFor, ensuring correct label association.',
    'aria-describedby is set to the description and/or status message IDs when those elements are present.',
    'aria-required="true" is set when isRequired is true.',
    'aria-invalid="true" is set when status.type is "error".',
    'aria-busy is set while an optimistic update or loading state is active.',
  ],
  notes: [
    'isOptional and isRequired are mutually exclusive; if both are set, "Optional" takes precedence.',
    'The component uses useOptimistic for instant UI feedback when onChangeAction returns a Promise.',
    'Textarea has vertical resize enabled via CSS with a minimum height of 80px.',
    'Wraps XDSField for consistent label, description, and status message layout.',
    'The character counter text turns red when value.length exceeds maxLength.',
  ],
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {...docs};
