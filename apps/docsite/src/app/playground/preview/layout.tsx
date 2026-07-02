// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file layout.tsx
 * @output The playground preview route, rendered bare (no docsite chrome).
 * @position Playground preview iframe — loads the document reset.
 *
 * The preview renders inside an iframe, so it deliberately adds no nav/footer.
 * previewReset.css gives the iframe document full height; the targeting-overlay
 * styles live with their code (propertyEditor/targetingOverlay.css).
 */

import './previewReset.css';

export default function PreviewLayout({children}: {children: React.ReactNode}) {
  return children;
}
