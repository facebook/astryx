// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useRef, useState} from 'react';
import type {PointerEvent} from 'react';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {useAnimator} from '@astryxdesign/core/hooks';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';
import {VisuallyHidden} from '@astryxdesign/core/VisuallyHidden';

const DECK = [
  {rank: 'A', suit: '\u2660', name: 'Ace of spades'},
  {rank: 'K', suit: '\u2665', name: 'King of hearts'},
  {rank: 'Q', suit: '\u2663', name: 'Queen of clubs'},
  {rank: 'J', suit: '\u2666', name: 'Jack of diamonds'},
];

/** A release faster than this (px/s) throws the card away. */
const THROW_SPEED = 1000;
/** The slowest throw, so a thrown card always leaves the table. */
const MIN_THROW = 1600;

interface Sample {
  t: number;
  x: number;
  y: number;
}

/** The release velocity in px/s, over the drag's last 80 ms. */
function releaseVelocity(samples: Sample[]): {x: number; y: number} {
  const last = samples.at(-1);
  const first = samples.find(s => last != null && last.t - s.t <= 80);
  if (last == null || first == null || last.t === first.t) {
    return {x: 0, y: 0};
  }
  const seconds = (last.t - first.t) / 1000;
  return {x: (last.x - first.x) / seconds, y: (last.y - first.y) / seconds};
}

export default function AnimatorPlayingCards() {
  const {ref, animator} = useAnimator();
  const [top, setTop] = useState(0);
  const [status, setStatus] = useState('');
  const drag = useRef<{start: Sample; samples: Sample[]} | null>(null);
  const card = DECK[top % DECK.length];

  // Throws the card away on its release velocity, then deals the next one.
  const discard = async (velocity: {x: number; y: number}) => {
    const speed = Math.hypot(velocity.x, velocity.y);
    const boost = speed < MIN_THROW ? MIN_THROW / Math.max(speed, 1) : 1;
    const throwX = speed < 1 ? MIN_THROW : velocity.x * boost;
    await Promise.all([
      animator.decay({x: throwX, y: velocity.y * boost}),
      animator.animate({opacity: 0}),
    ]);
    setStatus(`${card.name} discarded`);
    setTop(index => index + 1);
    // The next card is dealt in place.
    animator.set({x: 0, y: 0, rotate: 0, scale: 0.9, opacity: 0});
    await animator.animate({scale: 1, opacity: 1});
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    animator.stop();
    const {x, y} = animator.get();
    const start = {
      t: event.timeStamp,
      x: event.clientX - x,
      y: event.clientY - y,
    };
    drag.current = {start, samples: []};
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (current == null) {
      return;
    }
    const x = event.clientX - current.start.x;
    const y = event.clientY - current.start.y;
    current.samples.push({t: event.timeStamp, x, y});
    // The card follows the finger, turning a little with the drag.
    animator.set({x, y, rotate: x / 18});
  };

  const onPointerUp = () => {
    const current = drag.current;
    drag.current = null;
    if (current == null) {
      return;
    }
    const velocity = releaseVelocity(current.samples);
    if (Math.abs(velocity.x) > THROW_SPEED) {
      void discard(velocity);
    } else {
      // A gentle release springs back, carrying on as it was let go.
      void animator.animate({x: 0, y: 0, rotate: 0}, {velocity});
    }
  };

  return (
    <VStack gap={4} style={{maxWidth: 360, padding: 16}}>
      <Text type="body">
        Drag the card and let go. A gentle release springs it back; a quick
        flick throws it away.
      </Text>
      <div style={{height: 200, display: 'grid', placeItems: 'center'}}>
        <Card
          ref={ref}
          width={120}
          minHeight={170}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{touchAction: 'none', cursor: 'grab', userSelect: 'none'}}
          aria-label={card.name}>
          <VStack gap={1} hAlign="center" style={{paddingBlock: 40}}>
            <Text type="display-2" weight="bold">
              {card.rank}
            </Text>
            <Text type="display-3">{card.suit}</Text>
          </VStack>
        </Card>
      </div>
      <HStack gap={2}>
        <Button
          label={`Discard ${card.name}`}
          variant="secondary"
          onClick={() => void discard({x: MIN_THROW, y: 0})}
        />
        <Button
          label="Shake"
          variant="ghost"
          onClick={() =>
            void animator.animate(
              {x: 0, rotate: 0},
              {velocity: {x: 900, rotate: 300}},
            )
          }
        />
      </HStack>
      <VisuallyHidden as="div" aria-live="polite">
        {status}
      </VisuallyHidden>
    </VStack>
  );
}
