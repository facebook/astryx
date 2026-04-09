/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Toast',
  description:
    'Toast notification system with auto-dismiss, stacking, deduplication, and smooth animations. Uses XDSMediaTheme for inverted surface theming.',

  keywords: ["toast","notification","snackbar","alert","message","feedback","status"],
  features: [
    "Types: 'info' (default), 'error'",
    'Auto-dismiss: info toasts dismiss after 5s, error toasts persist',
    'Pause on hover/focus: timer pauses during interaction',
    'Stacking: multiple toasts stack with smooth enter/exit animations',
    'Deduplication: uniqueID with ignore or overwrite collision behavior',
    'Programmatic dismiss: show() returns a dismiss function',
    'End content slot: trailing actions (buttons, links)',
    'Fallback viewport: works without a provider via document.body fallback',
    'Inverted surface: uses XDSMediaTheme for correct colors on dark/light backgrounds',
    'Accessible: role=status/alert, aria-live=polite/assertive',
  ],

  props: [
    {
      name: 'body',
      type: 'ReactNode',
      description: 'Primary message content.',
      required: true,
    },
    {
      name: 'type',
      type: "'info' | 'error'",
      description: 'Toast type controlling background color. Error toasts persist until dismissed.',
      default: "'info'",
    },
    {
      name: 'isAutoHide',
      type: 'boolean',
      description: 'Whether the toast auto-dismisses. Defaults to true for info, false for error.',
    },
    {
      name: 'autoHideDuration',
      type: 'number',
      description: 'Duration in ms before auto-dismiss.',
      default: '5000',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description: 'Content rendered at the trailing end (e.g. Undo button, link).',
    },
    {
      name: 'uniqueID',
      type: 'string',
      description: 'Unique identifier for deduplication.',
    },
    {
      name: 'collisionBehavior',
      type: "'overwrite' | 'ignore'",
      description: 'Behavior when a toast with matching uniqueID already exists.',
      default: "'overwrite'",
    },
    {
      name: 'onHide',
      type: '(reason: "auto" | "manual") => void',
      description: 'Callback fired when the toast is removed.',
    },
  ],

  examples: [
    {
      label: 'Basic',
      code: `const toast = useXDSToast();\ntoast({ body: "Changes saved" });`,
    },
    {
      label: 'Error',
      code: `toast({ body: "Failed to save", type: "error" });`,
    },
    {
      label: 'With action',
      code: `toast({\n  body: "Item deleted",\n  isAutoHide: false,\n  endContent: <XDSButton label="Undo" variant="secondary" size="sm" onClick={undo} />,\n});`,
    },
  ],
};
