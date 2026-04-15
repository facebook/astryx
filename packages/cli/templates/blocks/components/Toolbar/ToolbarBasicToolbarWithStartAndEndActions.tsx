'use client';

import {XDSButton} from '@xds/core/Button';
import {XDSToolbar} from '@xds/core/Toolbar';

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

function UnderlineIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

export default function ToolbarBasicToolbarWithStartAndEndActions() {
  return (
    <XDSToolbar
      label="Text formatting"
      startContent={
        <>
          <XDSButton label="Bold" variant="ghost" icon={<BoldIcon />} />
          <XDSButton label="Italic" variant="ghost" icon={<ItalicIcon />} />
          <XDSButton label="Underline" variant="ghost" icon={<UnderlineIcon />} />
        </>
      }
      endContent={
        <XDSButton label="Settings" variant="ghost" icon={<SettingsIcon />} />
      }
    />
  );
}
