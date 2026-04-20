'use client';

import {useState} from 'react';
import {XDSToggleButton, XDSToggleButtonGroup} from '@xds/core/ToggleButton';

const iconSize = {width: 16, height: 16} as const;
const svgProps = {viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, ...iconSize};

const BoldIcon = (
  <svg {...svgProps}>
    <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6zM6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
  </svg>
);

const ItalicIcon = (
  <svg {...svgProps}>
    <path d="M10 4h4M14 20h-4M15 4l-6 16" />
  </svg>
);

const UnderlineIcon = (
  <svg {...svgProps}>
    <path d="M7 4v7a5 5 0 0 0 10 0V4M5 21h14" />
  </svg>
);

export default function ToggleButtonGroupMultiple() {
  const [formats, setFormats] = useState<string[]>([]);
  return (
    <XDSToggleButtonGroup
      type="multiple"
      value={formats}
      onChange={setFormats}
      label="Text formatting">
      <XDSToggleButton
        value="bold"
        label="Bold"
        icon={BoldIcon}
        isIconOnly
      />
      <XDSToggleButton
        value="italic"
        label="Italic"
        icon={ItalicIcon}
        isIconOnly
      />
      <XDSToggleButton
        value="underline"
        label="Underline"
        icon={UnderlineIcon}
        isIconOnly
      />
    </XDSToggleButtonGroup>
  );
}
