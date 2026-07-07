// Copyright (c) Meta Platforms, Inc. and affiliates.
//
// Catch-all libdefs for third-party packages Astryx imports that ship no Flow
// types. Stubbed as permissive object exports so Flow can resolve the module
// boundary and bind named specifiers as values. Replace with precise libdefs
// as adoption widens.

type AnyModule = { readonly [string]: unknown };

declare module '@heroicons/react/24/outline' { declare module.exports: AnyModule; }
declare module '@heroicons/react/24/solid' { declare module.exports: AnyModule; }
declare module '@heroicons/react/20/solid' { declare module.exports: AnyModule; }
declare module 'lucide-react' { declare module.exports: AnyModule; }
declare module '@storybook/react' { declare module.exports: AnyModule; }
declare module '@storybook/react-vite' { declare module.exports: AnyModule; }
declare module 'jscodeshift' { declare module.exports: AnyModule; }
declare module 'd3-scale' { declare module.exports: AnyModule; }
declare module 'next' { declare module.exports: AnyModule; }
declare module 'next/navigation' { declare module.exports: AnyModule; }
