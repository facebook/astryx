// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Markdown} from '@astryxdesign/core/Markdown';
import {Stack} from '@astryxdesign/core/Stack';
import {Card} from '@astryxdesign/core/Card';

const changelog = `# Changelog

## v2.4.0 (2026-07-15)

### New Features

- Added **dark mode** support across all components
- Introduced \`useTheme\` hook for programmatic theme switching
- New \`Carousel\` component with touch gesture support

### Bug Fixes

- Fixed focus trap escaping in nested dialogs
- Resolved \`z-index\` stacking issues with overlays
- Corrected \`aria-expanded\` state on collapsible sections

### Breaking Changes

- Removed deprecated \`color\` prop from \`Badge\`; use \`variant\` instead
- \`Dialog.onClose\` renamed to \`Dialog.onOpenChange\` for consistency

## v2.3.1 (2026-06-28)

### Bug Fixes

- Fixed SSR hydration mismatch in \`Tooltip\`
- Resolved infinite re-render in \`useMediaQuery\` on Safari

### Performance

- Reduced bundle size by **12%** through tree-shaking improvements
- Memoized expensive style computations in \`Table\`
`;

export function ChangelogView() {
  return (
    <Stack padding={4} gap={4}>
      <Card padding={4}>
        <Markdown>{changelog}</Markdown>
      </Card>
    </Stack>
  );
}

export default ChangelogView;
