import {useState} from 'react';
import {XDSToggleButton, XDSToggleButtonGroup} from '@xds/core/ToggleButton';
import {XDSIcon} from '@xds/core/Icon';
import {BoldIcon, ItalicIcon, UnderlineIcon} from '@heroicons/react/24/outline';

export default function ToggleButtonShowcase() {
  const [formats, setFormats] = useState<string[]>(['bold']);

  return (
    <XDSToggleButtonGroup
      type="multiple"
      value={formats}
      onChange={setFormats}
      label="Text formatting">
      <XDSToggleButton
        value="bold"
        label="Bold"
        icon={<XDSIcon icon={BoldIcon} />}
        isIconOnly
      />
      <XDSToggleButton
        value="italic"
        label="Italic"
        icon={<XDSIcon icon={ItalicIcon} />}
        isIconOnly
      />
      <XDSToggleButton
        value="underline"
        label="Underline"
        icon={<XDSIcon icon={UnderlineIcon} />}
        isIconOnly
      />
    </XDSToggleButtonGroup>
  );
}
