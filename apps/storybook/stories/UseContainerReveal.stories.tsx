// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import * as stylex from '@stylexjs/stylex';
import {useContainerReveal} from '@astryxdesign/core/hooks';
import {Button} from '@astryxdesign/core/Button';
import {mergeProps} from '@astryxdesign/core/utils';
import {TrashIcon, PencilIcon} from '@heroicons/react/24/outline';

const styles = stylex.create({
  stack: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    maxWidth: 360,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: '8px 12px',
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(0,0,0,0.12)',
    background: {
      default: 'transparent',
      ':hover': 'rgba(0,0,0,0.03)',
    },
  },
  label: {fontSize: 14},
  actions: {display: 'flex', gap: 4},
  hint: {fontSize: 12, color: '#888', marginBottom: 8},
  nested: {
    marginTop: 8,
    marginInlineStart: 24,
    borderInlineStartWidth: 2,
    borderInlineStartStyle: 'solid',
    borderInlineStartColor: 'rgba(0,0,0,0.08)',
    paddingInlineStart: 8,
  },
});

/**
 * A row whose secondary actions are hidden at rest and revealed when the row
 * is hovered or focused. The action stays in the a11y tree and tab order.
 */
function RevealRow({label}: {label: string}) {
  const {getContainerProps, getContentRevealProps} = useContainerReveal();
  return (
    <div {...mergeProps(getContainerProps(), stylex.props(styles.row))}>
      <span {...stylex.props(styles.label)}>{label}</span>
      <span {...mergeProps(getContentRevealProps(), stylex.props(styles.actions))}>
        <Button
          label={`Edit ${label}`}
          variant="ghost"
          isIconOnly
          icon={<PencilIcon style={{width: 16, height: 16}} />}
        />
        <Button
          label={`Delete ${label}`}
          variant="ghost"
          isIconOnly
          icon={<TrashIcon style={{width: 16, height: 16}} />}
        />
      </span>
    </div>
  );
}

const meta: Meta = {
  title: 'Hooks/useContainerReveal',
};
export default meta;
type Story = StoryObj;

/** Hover or tab into a row to reveal its actions. */
export const Reveal: Story = {
  render: () => (
    <div {...stylex.props(styles.stack)}>
      <p {...stylex.props(styles.hint)}>
        Hover a row — or press Tab to focus into it — to reveal its actions.
        On touch devices the actions are always visible.
      </p>
      <RevealRow label="report.pdf" />
      <RevealRow label="budget.xlsx" />
      <RevealRow label="notes.txt" />
    </div>
  ),
};

/**
 * Inverted: content is visible at rest and fades OUT on hover. Mouse-only —
 * it never hides on keyboard focus and stays visible on touch.
 */
export const InvertedConceal: Story = {
  render: () => {
    function ConcealRow({label}: {label: string}) {
      const {getContainerProps, getContentRevealProps} = useContainerReveal();
      return (
        <div {...mergeProps(getContainerProps(), stylex.props(styles.row))}>
          <span {...stylex.props(styles.label)}>{label}</span>
          <span
            {...mergeProps(
              getContentRevealProps({isRevealInverted: true}),
              stylex.props(styles.label),
            )}>
            edited 2h ago
          </span>
        </div>
      );
    }
    return (
      <div {...stylex.props(styles.stack)}>
        <p {...stylex.props(styles.hint)}>
          The timestamp shows at rest and fades out on mouse hover (a visual
          declutter). It stays put for keyboard and touch users.
        </p>
        <ConcealRow label="report.pdf" />
        <ConcealRow label="budget.xlsx" />
      </div>
    );
  },
};

/**
 * Layout-preserved reveal reserves the action's box at rest, so surrounding
 * content does not shift when it appears.
 */
export const PreserveLayout: Story = {
  render: () => {
    function PreserveRow({label}: {label: string}) {
      const {getContainerProps, getContentRevealProps} = useContainerReveal();
      return (
        <div {...mergeProps(getContainerProps(), stylex.props(styles.row))}>
          <span {...stylex.props(styles.label)}>{label}</span>
          <span
            {...mergeProps(
              getContentRevealProps({isLayoutPreserved: true}),
              stylex.props(styles.actions),
            )}>
            <Button
              label={`Delete ${label}`}
              variant="ghost"
              isIconOnly
              icon={<TrashIcon style={{width: 16, height: 16}} />}
            />
          </span>
        </div>
      );
    }
    return (
      <div {...stylex.props(styles.stack)}>
        <p {...stylex.props(styles.hint)}>
          The action's space is reserved even while hidden — no reflow when it
          fades in.
        </p>
        <PreserveRow label="report.pdf" />
        <PreserveRow label="budget.xlsx" />
      </div>
    );
  },
};

/**
 * Nested containers each get their own scoped marker from the pool, so
 * hovering the outer row does NOT reveal the inner row's actions.
 */
export const NestedIsolation: Story = {
  render: () => (
    <div {...stylex.props(styles.stack)}>
      <p {...stylex.props(styles.hint)}>
        Hover the outer row: only its own actions appear. The nested row keeps
        its actions hidden until you hover it directly — proof that the pool
        gives each container an isolated marker.
      </p>
      <div>
        <RevealRow label="Parent folder" />
        <div {...stylex.props(styles.nested)}>
          <RevealRow label="Nested file" />
        </div>
      </div>
    </div>
  ),
};
