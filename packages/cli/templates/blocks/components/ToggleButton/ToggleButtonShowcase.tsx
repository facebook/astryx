import {XDSToggleButton} from '@xds/core/ToggleButton';

const BoldIcon = (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
    <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
  </svg>
);

export default function ToggleButtonShowcase() {
  return (
    <XDSToggleButton
      label="Bold"
      icon={BoldIcon}
      isPressed={false}
      onPressedChange={() => {}}
      isIconOnly
    />
  );
}
