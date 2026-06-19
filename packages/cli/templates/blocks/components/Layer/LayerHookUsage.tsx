// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useLayer} from '@xds/core/Layer';
import {Button} from '@xds/core/Button';
import {Card} from '@xds/core/Card';
import {Center} from '@xds/core/Center';
import {VStack} from '@xds/core/Layout';
import {Text} from '@xds/core/Text';

export default function LayerHookUsage() {
  const layer = useLayer({mode: 'context', lightDismiss: true});

  return (
    <Center height={220}>
      <Button
        label={layer.isOpen ? 'Hide layer' : 'Show layer'}
        ref={layer.ref}
        onClick={layer.isOpen ? layer.hide : layer.show}
      />
      {layer.render(
        <Card padding={3}>
          <VStack gap={1}>
            <Text type="body" weight="bold">
              Anchored content
            </Text>
            <Text type="body" color="secondary">
              useLayer provides positioning; you own semantics and surface.
            </Text>
          </VStack>
        </Card>,
        {placement: 'below', alignment: 'center'},
      )}
    </Center>
  );
}
