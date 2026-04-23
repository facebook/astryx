'use client';

import {XDSKbd} from '@xds/core/Kbd';
import {XDSVStack, XDSHStack} from '@xds/core/Stack';
import {XDSText} from '@xds/core/Text';

export default function KbdModifierCombos() {
  return (
    <XDSVStack gap={3}>
      <XDSHStack gap={4}>
        <XDSKbd keys="mod+k" />
        <XDSKbd keys="shift+enter" />
        <XDSKbd keys="ctrl+c" />
        <XDSKbd keys="alt+tab" />
      </XDSHStack>
      <XDSHStack gap={4}>
        <XDSKbd keys="mod+shift+z" />
        <XDSKbd keys="ctrl+alt+delete" />
        <XDSKbd keys="mod+shift+p" />
      </XDSHStack>
      <XDSHStack gap={4}>
        <XDSText type="body">Special keys:</XDSText>
        <XDSKbd keys="escape" />
        <XDSKbd keys="enter" />
        <XDSKbd keys="backspace" />
        <XDSKbd keys="tab" />
        <XDSKbd keys="space" />
      </XDSHStack>
    </XDSVStack>
  );
}
