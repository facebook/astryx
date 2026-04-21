'use client';

import {XDSPopover} from '@xds/core/Popover';
import {XDSButton} from '@xds/core/Button';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSDivider} from '@xds/core/Divider';

const shortcuts = [
  {key: '⌘K', action: 'Command palette'},
  {key: '⌘/', action: 'Toggle sidebar'},
  {key: '⌘.', action: 'Quick actions'},
];

export default function PopoverKeyboardShortcuts() {
  return (
    <XDSPopover
      placement="below"
      label="Keyboard shortcuts"
      width={260}
      content={
        <XDSVStack gap={2}>
          <XDSHeading level={4}>
            Keyboard shortcuts
          </XDSHeading>
          <XDSDivider />
          {shortcuts.map(s => (
            <XDSHStack key={s.key} gap={3}>
              <XDSText type="body" weight="bold">
                {s.key}
              </XDSText>
              <XDSText type="body">{s.action}</XDSText>
            </XDSHStack>
          ))}
        </XDSVStack>
      }>
      <XDSButton label="Shortcuts">Shortcuts</XDSButton>
    </XDSPopover>
  );
}
