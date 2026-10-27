// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ReorderableAttach.stories.tsx
 * @input createReorderable and plain elements laid out by the story
 * @output createReorderable's attach on plain elements with positions()
 * @position Storybook demonstrations for createReorderable consumers
 */

import {useEffect, useMemo, useRef, useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {Meta, StoryObj} from '@storybook/react';
import {createReorderable} from '@astryxdesign/core/reorderable';
import {colorVars, radiusVars} from '@astryxdesign/core/theme/tokens.stylex';

const meta: Meta = {
  title: 'Core/createReorderable',
  parameters: {layout: 'centered'},
};

export default meta;
type Story = StoryObj;

/** Each card's slot: the centre of a 72 x 96 card, 88 px apart in a row. */
const ROW = [0, 1, 2, 3, 4].map(index => ({
  x: 44 + index * 88,
  y: 56,
  angle: 0,
}));

/**
 * A fanned hand: five slots on an arc of radius 160 around (220, 230), 12°
 * apart, each card turned to its slot's angle.
 */
const FAN = [-24, -12, 0, 12, 24].map(angle => {
  const radians = (angle * Math.PI) / 180;
  return {
    x: Math.round(220 + 160 * Math.sin(radians)),
    y: Math.round(230 - 160 * Math.cos(radians)),
    angle,
  };
});

function moveKey(
  keys: ReadonlyArray<string>,
  key: unknown,
  to: number,
): string[] {
  const next = keys.filter(each => each !== key);
  next.splice(to, 0, key as string);
  return next;
}

const styles = stylex.create({
  table: {
    position: 'relative',
    inlineSize: 88 * 5,
    blockSize: 112,
  },
  fanTable: {
    blockSize: 160,
  },
  card: {
    position: 'absolute',
    boxSizing: 'border-box',
    inlineSize: 72,
    blockSize: 96,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radiusVars['--radius-container'],
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colorVars['--color-border'],
    backgroundColor: colorVars['--color-background-card'],
    color: colorVars['--color-text-primary'],
    fontSize: 24,
  },
  slot: (x: number, y: number, angle: number) => ({
    insetInlineStart: x - 36,
    top: y - 48,
    rotate: `${angle}deg`,
  }),
  // At the card's top-left corner, the part of each card a fanned hand
  // leaves showing.
  grip: {
    position: 'absolute',
    top: 4,
    insetInlineStart: 4,
    inlineSize: 28,
    blockSize: 20,
    borderRadius: 4,
    color: colorVars['--color-icon-secondary'],
    fontSize: 14,
    lineHeight: '20px',
    textAlign: 'center',
    cursor: 'grab',
  },
});

/**
 * Plain elements, laid out by the app, reordered through
 * `reorderable.attach`: each card's grip is its handle, and `positions()`
 * gives each card's slot (spec:AST-103 FR1, FR4b).
 */
function AttachedCards({
  slots,
}: {
  slots: ReadonlyArray<{x: number; y: number; angle: number}>;
}) {
  const tableRef = useRef<HTMLDivElement>(null);
  const [cards, setCards] = useState(['A', 'K', 'Q', 'J', '10']);
  const [moves, setMoves] = useState(0);
  const reorderable = useMemo(
    () =>
      createReorderable<string>({
        onReorder: ({key, to}) => {
          setMoves(count => count + 1);
          setCards(current => moveKey(current, key, to));
        },
        positions: () => slots,
      }),
    [slots],
  );
  // External system: the attached reorder on the table's plain elements,
  // detached on unmount.
  useEffect(() => {
    const table = tableRef.current;
    if (table == null) {
      return undefined;
    }
    const {detach} = reorderable.attach(table, {
      items: () =>
        Array.from(table.querySelectorAll<HTMLElement>('[data-card]')).map(
          element => ({
            key: element.dataset.card,
            element,
            handle:
              element.querySelector<HTMLElement>('[data-grip]') ?? element,
          }),
        ),
    });
    return detach;
  }, [reorderable]);
  return (
    <div
      ref={tableRef}
      data-moves={moves}
      {...stylex.props(styles.table, slots === FAN && styles.fanTable)}>
      {cards.map((card, index) => (
        <div
          key={card}
          data-card={card}
          aria-label={`Card ${card}`}
          {...stylex.props(
            styles.card,
            styles.slot(slots[index].x, slots[index].y, slots[index].angle),
          )}>
          <span>{card}</span>
          <span data-grip="" {...stylex.props(styles.grip)}>
            ⋮⋮
          </span>
        </div>
      ))}
    </div>
  );
}

export const AttachedCardsInARow: Story = {
  render: () => <AttachedCards slots={ROW} />,
  parameters: {
    docs: {
      description: {
        story:
          'Plain elements reorder through `reorderable.attach(container, ' +
          '{items})`, with no collection component: each card’s grip is its ' +
          'handle, and `positions()` gives each card’s slot. Drag a grip (on ' +
          'a touch screen, hold it first), or activate it and use the arrow ' +
          'keys.',
      },
    },
  },
};

export const AttachedCardsInAFan: Story = {
  render: () => <AttachedCards slots={FAN} />,
  parameters: {
    docs: {
      description: {
        story:
          'A fanned hand: `positions()` gives each card a slot on an arc, and ' +
          'a dragged card drops on the slot whose centre is nearest its own.',
      },
    },
  },
};
