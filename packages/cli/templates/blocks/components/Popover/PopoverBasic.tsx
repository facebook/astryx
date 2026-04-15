'use client';

import {XDSPopover} from '@xds/core/Popover';
import {XDSButton} from '@xds/core/Button';

function SettingsPanel() {
  return (
    <div style={{padding: 16}}>
      <p>Settings content goes here</p>
    </div>
  );
}

export default function PopoverBasic() {
  return (
    <XDSPopover
      label="Settings"
      content={<SettingsPanel />}
      placement="below">
      <XDSButton label="Settings" />
    </XDSPopover>
  );
}
