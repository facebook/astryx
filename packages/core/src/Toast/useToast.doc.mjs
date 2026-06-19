// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').HookDoc} */
export const docs = {
  name: 'useToast',
  displayName: 'useToast',
  group: 'Toast',
  keywords: ['toast', 'notification', 'snackbar', 'alert', 'message', 'feedback', 'flash'],
  params: [
    // useToast takes no arguments — returns a show function
  ],
  returns: [
    {
      name: 'showToast',
      type: '(options: ToastOptions) => () => void',
      description: 'Show a toast notification. Returns a dismiss function. Options include body (ReactNode), type ("info" | "error"), isAutoHide, autoHideDuration, endContent, uniqueID, and collisionBehavior.',
    },
  ],
  usage: {
    description: 'Hook for showing toast notifications from anywhere in your component tree. Returns a function that accepts toast options and shows the notification. Works automatically with LayerProvider or self-mounts a fallback viewport.',
    bestPractices: [
      {guidance: true, description: 'Use for transient success/error feedback that does not require user action.'},
      {guidance: true, description: 'Set uniqueID to deduplicate toasts from rapid user actions.'},
      {guidance: false, description: 'Use for critical errors that require acknowledgment; use AlertDialog instead.'},
      {guidance: false, description: 'Call useToast in the same component that renders LayerProvider; it must be called from a child component inside the provider.'},
    ],
  },
  relatedComponents: ['Toast', 'Banner', 'AlertDialog'],
  relatedHooks: [],
  importPath: '@xds/core/Toast',
  category: 'interaction',
};

/** @type {import('../docs-types').HookTranslationDoc} */
export const docsDense = {
  description: 'Show toast notifications from anywhere in component tree. Returns function accepting toast options + showing notification. Works automatically w/ LayerProvider / self-mounts fallback viewport.',
  returnDescriptions: {
    showToast: 'show toast notification. Returns dismiss function. Options: body (ReactNode), type ("info" | "error"), isAutoHide, autoHideDuration, endContent, uniqueID, collisionBehavior.',
  },
  usage: {
    description: 'Show toast notifications from anywhere in component tree. Returns function accepting toast options + showing notification. Works automatically w/ LayerProvider / self-mounts fallback viewport.',
    bestPractices: [
      {guidance: true, description: 'Use for transient success/error feedback not requiring user action.'},
      {guidance: true, description: 'Set uniqueID to deduplicate toasts from rapid user actions.'},
      {guidance: false, description: 'Use for critical errors requiring acknowledgment; use AlertDialog instead.'},
      {guidance: false, description: 'Call useToast in same component that renders LayerProvider; must be called from child component inside provider.'},
    ],
  },
};
