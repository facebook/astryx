// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file serverEntryClientParts.ts
 * @input Nothing
 * @output Exports SERVER_ENTRY_CLIENT_PARTS: per `react-server` entry, the
 *   client modules its server graph may reach, and why
 * @position Test fixture shared by serverSafeComponents.test.ts (the static
 *   import-graph walk must reach exactly these) and serverRender.test.tsx
 *   (which swaps each for a client reference, as an RSC bundler does).
 *
 * SYNC: When a server shell gains or drops a client part, update this list
 * and the shell's header.
 */

/**
 * The client modules each `react-server` entry may reach, and why. A server
 * entry renders its presentational path on the server; everything listed
 * here is a client part, loaded only where its comment says. Adding a client
 * import to a shell, or dropping one, fails the walk below until this list
 * says why.
 */
export const SERVER_ENTRY_CLIENT_PARTS: Record<
  string,
  Record<string, string>
> = {
  Button: {
    'Button/Button.tsx':
      'the interactive Button: clickAction, isLoading, tooltip, ref or a function prop, and a provider take-over',
    'Button/ButtonContextGate.tsx':
      'reads the size, ButtonGroup, InputGroup and LinkProvider contexts; installs the touch press controller',
    'Icon/IconSizeScope.tsx':
      'sets the default size of an Icon in the icon slot',
  },
  IconButton: {
    'Button/Button.tsx': 'as for Button',
    'Button/ButtonContextGate.tsx': 'as for Button',
    'Icon/IconSizeScope.tsx': 'as for Button',
  },
  TopNav: {
    'TopNav/TopNav.tsx':
      "the client TopNav: AppShell's mobile bar and drawer, a ref or a function prop",
    'TopNav/TopNavFrame.tsx':
      'the landmark; reads the AppShell render mode; sets the slot for menus',
    'TopNav/TopNavLocalizedFrame.tsx':
      'only without a `label`: translates the default landmark label',
    'TopNav/TopNavItem.tsx':
      'the client TopNavItem: the drawer, LinkProvider, onClick, a ref or a component `as`',
    'TopNav/TopNavItemGate.tsx':
      'reads the render mode and LinkProvider; installs the touch press controller',
    // Re-exported unchanged: client modules through either entry.
    'TopNav/TopNavHeading.tsx': 're-exported client module',
    'TopNav/TopNavMenu.tsx': 're-exported client module',
    'TopNav/TopNavMegaMenu.tsx': 're-exported client module',
    'TopNav/TopNavMegaMenuItem.tsx': 're-exported client module',
    'TopNav/TopNavMegaMenuFeaturedCard.tsx': 're-exported client module',
    'TopNav/TopNavRenderContext.ts': 're-exported client module',
  },
};
