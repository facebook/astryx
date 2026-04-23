'use client';

import {XDSKbd} from '@xds/core/Kbd';
import {XDSVStack} from '@xds/core/Stack';
import {XDSText} from '@xds/core/Text';

export default function KbdInlineInstructions() {
  return (
    <XDSVStack gap={3}>
      <XDSText type="body">
        Press <XDSKbd keys="mod+k" /> to open the command palette.
      </XDSText>
      <XDSText type="body">
        Use <XDSKbd keys="mod+shift+p" /> to access all commands.
      </XDSText>
      <XDSText type="body">
        Press <XDSKbd keys="escape" /> to close the dialog.
      </XDSText>
      <XDSText type="body">
        Navigate with <XDSKbd keys="up" /> and <XDSKbd keys="down" /> arrow
        keys, then press <XDSKbd keys="enter" /> to select.
      </XDSText>
    </XDSVStack>
  );
}
