// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').HookDoc} */
export const docs = {
  name: 'useXDSAppShellMobile',
  displayName: 'useXDSAppShellMobile',
  group: 'AppShell',
  category: 'layout',
  keywords: [
    'appshell',
    'mobile nav',
    'mobile drawer',
    'hamburger',
    'navigation toggle',
    'responsive navigation',
    'drawer state',
  ],
  params: [
    // useXDSAppShellMobile takes no arguments — it reads AppShell context.
  ],
  returns: [
    {
      name: 'isMobile',
      type: 'boolean',
      description:
        'Whether the current viewport is below the AppShell mobile navigation breakpoint. Use this to synchronize AppShell-adjacent mobile UI with the same breakpoint as mobile nav.',
    },
    {
      name: 'isMobileNavOpen',
      type: 'boolean',
      description:
        'Whether the AppShell-managed mobile navigation drawer is open.',
    },
    {
      name: 'toggleMobileNav',
      type: '() => void',
      description:
        'Toggle the AppShell-managed mobile navigation drawer. No-ops when mobile nav is disabled.',
    },
    {
      name: 'openMobileNav',
      type: '() => void',
      description:
        'Open the AppShell-managed mobile navigation drawer. No-ops when mobile nav is disabled.',
    },
    {
      name: 'closeMobileNav',
      type: '() => void',
      description: 'Close the AppShell-managed mobile navigation drawer.',
    },
    {
      name: 'isMobileNavEnabled',
      type: 'boolean',
      description:
        'Whether AppShell mobile navigation is enabled and managed by AppShell. False when mobileNav is false, there is no nav content, or a fully custom mobileNav ReactNode owns the drawer.',
    },
    {
      name: 'hasAutoToggle',
      type: 'boolean',
      description:
        'Whether AppShell auto-toggle behavior is enabled. False when mobileNav hasToggle is set to false; combine with isMobile and isMobileNavEnabled before rendering custom toggles.',
    },
  ],
  usage: {
    description:
      'Hook for reading and controlling XDSAppShell mobile navigation state from descendants of AppShell. Use it for custom mobile nav triggers, closing the drawer after route changes, or coordinating AppShell-adjacent mobile experiences with the same breakpoint used by mobile nav.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use inside the XDSAppShell tree when building custom mobile navigation controls, route-aware nav items, or UI that should update at the same breakpoint as AppShell mobile nav.',
      },
      {
        guidance: true,
        description:
          'Prefer XDSMobileNavToggle for the standard hamburger trigger: use this hook when you need custom placement, styling, or extra behavior.',
      },
      {
        guidance: true,
        description:
          'Call closeMobileNav after a custom mobile nav item changes route so the drawer dismisses cleanly.',
      },
      {
        guidance: false,
        description:
          'Use as a general responsive primitive when the UI is not inside AppShell or does not need to align with AppShell mobile nav: use useMediaQuery instead.',
      },
      {
        guidance: false,
        description:
          'Assume it throws outside AppShell. The hook returns safe defaults and no-op callbacks when no provider is present.',
      },
    ],
  },
  relatedComponents: [
    'AppShell',
    'MobileNav',
    'MobileNavToggle',
    'TopNav',
    'SideNav',
  ],
  relatedHooks: ['useMediaQuery'],
  importPath: '@xds/core/AppShell',
};

/** @type {import('../docs-types').HookTranslationDoc} */
export const docsDense = {
  description:
    'Reads/controls XDSAppShell mobile nav context. Use for custom triggers, closing drawer after route changes, or syncing AppShell-adjacent mobile UI to the same breakpoint as mobile nav.',
  returnDescriptions: {
    isMobile:
      'viewport below AppShell mobile nav breakpoint? Use to sync AppShell-adjacent mobile UI',
    isMobileNavOpen: 'AppShell-managed mobile nav drawer open?',
    toggleMobileNav: 'toggle drawer; no-op when mobile nav disabled',
    openMobileNav: 'open drawer; no-op when mobile nav disabled',
    closeMobileNav: 'close drawer',
    isMobileNavEnabled:
      'AppShell owns mobile nav? false when mobileNav=false, no nav content, or custom ReactNode owns drawer',
    hasAutoToggle:
      'auto-toggle enabled? false when mobileNav.hasToggle=false; combine w/ isMobile + isMobileNavEnabled before custom toggle render',
  },
  usage: {
    description:
      'Reads/controls XDSAppShell mobile nav context. Use for custom triggers, closing drawer after route changes, or syncing AppShell-adjacent mobile UI to the same breakpoint as mobile nav.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use inside XDSAppShell tree for custom nav controls, route-aware nav items, or UI that should update at AppShell mobile nav breakpoint.',
      },
      {
        guidance: true,
        description:
          'Prefer XDSMobileNavToggle for standard hamburger; use hook for custom placement, styling, or extra behavior.',
      },
      {
        guidance: true,
        description:
          'Call closeMobileNav after custom mobile nav item changes route so drawer dismisses.',
      },
      {
        guidance: false,
        description:
          'Use as general responsive primitive when not inside AppShell / not aligning to AppShell mobile nav: use useMediaQuery instead.',
      },
      {
        guidance: false,
        description:
          'Assume it throws outside AppShell. Hook returns safe defaults + no-op callbacks without provider.',
      },
    ],
  },
};
