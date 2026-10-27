// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useEffect, useRef} from 'react';
import {createAnimator} from '@astryxdesign/core/animator';

const DECK = ['A\u2660', 'K\u2665', 'Q\u2663', 'J\u2666'];
/** A release faster than this (px/s) throws the card away. */
const THROW_SPEED = 1000;
/** The slowest throw, so a thrown card always leaves the table. */
const MIN_THROW = 1600;

/**
 * A deck on a table, in plain JavaScript: no React below this line. It
 * returns a function that takes it down again.
 */
function mountDeck(table: HTMLElement, discardButton: HTMLButtonElement) {
  let top = 0;
  const card = document.createElement('div');
  card.textContent = DECK[0];
  card.setAttribute('aria-label', 'Top card');
  Object.assign(card.style, {
    width: '120px',
    height: '170px',
    display: 'grid',
    placeItems: 'center',
    font: 'bold 40px system-ui, sans-serif',
    borderRadius: '12px',
    background: 'white',
    boxShadow: '0 2px 8px rgb(0 0 0 / 0.2)',
    touchAction: 'none',
    cursor: 'grab',
    userSelect: 'none',
  });
  table.append(card);
  const animator = createAnimator(card);

  async function discard(vx: number, vy: number) {
    const speed = Math.hypot(vx, vy);
    const boost = speed < MIN_THROW ? MIN_THROW / Math.max(speed, 1) : 1;
    await Promise.all([
      animator.decay({x: speed < 1 ? MIN_THROW : vx * boost, y: vy * boost}),
      animator.animate({opacity: 0}),
    ]);
    top += 1;
    card.textContent = DECK[top % DECK.length];
    animator.set({x: 0, y: 0, rotate: 0, scale: 0.9, opacity: 0});
    await animator.animate({scale: 1, opacity: 1});
  }

  // The drag: follow the pointer, then read the last 80 ms on release.
  let origin: {x: number; y: number} | null = null;
  let samples: {t: number; x: number; y: number}[] = [];
  function onDown(event: PointerEvent) {
    card.setPointerCapture(event.pointerId);
    animator.stop();
    const {x, y} = animator.get();
    origin = {x: event.clientX - x, y: event.clientY - y};
    samples = [];
  }
  function onMove(event: PointerEvent) {
    if (origin == null) {
      return;
    }
    const x = event.clientX - origin.x;
    const y = event.clientY - origin.y;
    samples.push({t: event.timeStamp, x, y});
    animator.set({x, y, rotate: x / 18});
  }
  function onUp() {
    if (origin == null) {
      return;
    }
    origin = null;
    const last = samples.at(-1);
    const first = samples.find(s => last != null && last.t - s.t <= 80);
    const seconds = last && first ? (last.t - first.t) / 1000 : 0;
    const vx = seconds > 0 && last && first ? (last.x - first.x) / seconds : 0;
    const vy = seconds > 0 && last && first ? (last.y - first.y) / seconds : 0;
    if (Math.abs(vx) > THROW_SPEED) {
      void discard(vx, vy);
    } else {
      void animator.animate(
        {x: 0, y: 0, rotate: 0},
        {velocity: {x: vx, y: vy}},
      );
    }
  }
  const onDiscard = () => void discard(MIN_THROW, 0);

  card.addEventListener('pointerdown', onDown);
  card.addEventListener('pointermove', onMove);
  card.addEventListener('pointerup', onUp);
  card.addEventListener('pointercancel', onUp);
  discardButton.addEventListener('click', onDiscard);
  return () => {
    discardButton.removeEventListener('click', onDiscard);
    animator.destroy();
    card.remove();
  };
}

export default function AnimatorPlayingCardsVanilla() {
  const table = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (table.current == null || button.current == null) {
      return undefined;
    }
    return mountDeck(table.current, button.current);
  }, []);
  return (
    <div style={{display: 'grid', gap: 16, padding: 16, maxWidth: 360}}>
      <div
        ref={table}
        style={{height: 200, display: 'grid', placeItems: 'center'}}
      />
      <button ref={button} type="button">
        Discard the top card
      </button>
    </div>
  );
}
