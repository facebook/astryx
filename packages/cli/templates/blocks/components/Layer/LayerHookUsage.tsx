// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useXDSLayer} from '@xds/core/Layer';
import {XDSButton} from '@xds/core/Button';
import {XDSCard} from '@xds/core/Card';
import {XDSCenter} from '@xds/core/Center';
import {XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function LayerHookUsage() {
  const layer = useXDSLayer({mode: 'context', lightDismiss: true});

  return (
    <XDSCenter height={220}>
      <XDSButton
        label={layer.isOpen ? 'Hide layer' : 'Show layer'}
        ref={layer.ref}
        onClick={layer.isOpen ? layer.hide : layer.show}
      />
      {layer.render(
        <XDSCard padding={3}>
          <XDSVStack gap={1}>
            <XDSText type="body" weight="bold">
              Anchored content
            </XDSText>
            <XDSText type="body" color="secondary">
              useXDSLayer provides positioning; you own semantics and surface.
            </XDSText>
          </XDSVStack>
        </XDSCard>,
        {placement: 'below', alignment: 'center'},
      )}
    </XDSCenter>
  );
}
