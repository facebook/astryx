// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useRef, useState} from 'react';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {useDragToSnapPoints} from '@astryxdesign/core/hooks';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';
import {VisuallyHidden} from '@astryxdesign/core/VisuallyHidden';

const PLACES = ['Hand', 'Table', 'Discard pile'];
/** Where each place sits, in px from the card's resting position. */
const SNAP_POINTS = [0, 110, 220];

export default function DragToSnapPointsCard() {
  const ref = useRef<HTMLDivElement>(null);
  const [place, setPlace] = useState(0);
  const {settleTo} = useDragToSnapPoints(ref, {
    axis: 'x',
    snapPoints: SNAP_POINTS,
    onSettle: setPlace,
  });

  return (
    <VStack gap={4} style={{maxWidth: 380, padding: 16}}>
      <Text type="body">
        Drag the card sideways and let go: it settles on the nearest place, or
        the next one after a quick flick.
      </Text>
      <HStack gap={2} style={{height: 150, alignItems: 'center'}}>
        <Card
          ref={ref}
          width={96}
          minHeight={136}
          style={{touchAction: 'none', cursor: 'grab', userSelect: 'none'}}
          aria-label={`Queen of hearts, on the ${PLACES[place].toLowerCase()}`}>
          <VStack gap={1} hAlign="center" style={{paddingBlock: 32}}>
            <Text type="display-2" weight="bold">
              Q
            </Text>
            <Text type="display-3">{'\u2665'}</Text>
          </VStack>
        </Card>
      </HStack>
      <HStack gap={2}>
        {PLACES.map((name, index) => (
          <Button
            key={name}
            label={name}
            variant={index === place ? 'primary' : 'secondary'}
            onClick={() => settleTo(index)}
          />
        ))}
      </HStack>
      <VisuallyHidden as="div" aria-live="polite">
        {`The card is on the ${PLACES[place].toLowerCase()}.`}
      </VisuallyHidden>
    </VStack>
  );
}
