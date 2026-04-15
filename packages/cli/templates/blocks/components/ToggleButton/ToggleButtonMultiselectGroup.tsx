'use client';

import {useState} from 'react';
import {XDSToggleButton, XDSToggleButtonGroup} from '@xds/core/ToggleButton';

function BoldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

function ItalicIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

export default function ToggleButtonMultiselectGroup() {
  const [formats, setFormats] = useState<string[]>([]);

  return (
    <XDSToggleButtonGroup
      type="multiple"
      value={formats}
      onChange={setFormats}
      label="Formatting">
      <XDSToggleButton value="bold" label="Bold" icon={<BoldIcon />} />
      <XDSToggleButton value="italic" label="Italic" icon={<ItalicIcon />} />
    </XDSToggleButtonGroup>
  );
}
