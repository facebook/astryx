// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file StatePanel.tsx
 * @output Live form-state panel (Formisch-playground style): values, errors,
 *   touched, validity, submit payload — derived from the rendered form's DOM.
 */

import * as React from 'react';
import * as stylex from '@stylexjs/stylex';
import {Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import type {ObservedFormState} from './useFormObserver';

const styles = stylex.create({
  panel: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    padding: 16,
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    fontSize: 12,
  },
  row: {display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap'},
  block: {display: 'flex', flexDirection: 'column', gap: 6},
  kv: {
    display: 'grid',
    gridTemplateColumns: 'minmax(90px, auto) 1fr',
    gap: '2px 12px',
    alignItems: 'baseline',
  },
  key: {color: 'var(--color-text-secondary)'},
  val: {color: 'var(--color-text-primary)', wordBreak: 'break-word'},
  err: {color: 'var(--color-text-negative, #c0392b)'},
  pre: {
    margin: 0,
    padding: 10,
    borderRadius: 6,
    backgroundColor: 'var(--color-surface-raised, rgba(0,0,0,0.04))',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  sectionLabel: {
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    fontSize: 10,
    color: 'var(--color-text-secondary)',
  },
});

function Bool({value}: {value: boolean}) {
  return (
    <Badge variant={value ? 'success' : 'neutral'}>
      {value ? 'true' : 'false'}
    </Badge>
  );
}

export function StatePanel({state}: {state: ObservedFormState}) {
  const {values, errors, touched, isValid, submitCount, lastSubmit} = state;
  const errorEntries = Object.entries(errors);

  return (
    <div {...stylex.props(styles.panel)}>
      <div {...stylex.props(styles.row)}>
        <span {...stylex.props(styles.sectionLabel)}>isValid</span>
        <Bool value={isValid} />
        <span {...stylex.props(styles.sectionLabel)}>submitted</span>
        <Badge variant={submitCount > 0 ? 'info' : 'neutral'}>
          {String(submitCount)}
        </Badge>
        <span {...stylex.props(styles.sectionLabel)}>touched</span>
        <Badge variant="neutral">{String(touched.length)}</Badge>
      </div>

      <div {...stylex.props(styles.block)}>
        <span {...stylex.props(styles.sectionLabel)}>values</span>
        <div {...stylex.props(styles.kv)}>
          {Object.keys(values).length === 0 ? (
            <span {...stylex.props(styles.key)}>—</span>
          ) : (
            Object.entries(values).map(([k, v]) => (
              <React.Fragment key={k}>
                <span {...stylex.props(styles.key)}>{k}</span>
                <span {...stylex.props(styles.val)}>
                  {v === '' ? '""' : v}
                  {touched.includes(k) ? ' •' : ''}
                </span>
              </React.Fragment>
            ))
          )}
        </div>
      </div>

      <div {...stylex.props(styles.block)}>
        <span {...stylex.props(styles.sectionLabel)}>errors</span>
        {errorEntries.length === 0 ? (
          <span {...stylex.props(styles.key)}>none</span>
        ) : (
          <div {...stylex.props(styles.kv)}>
            {errorEntries.map(([k, v]) => (
              <React.Fragment key={k}>
                <span {...stylex.props(styles.key, styles.err)}>{k}</span>
                <span {...stylex.props(styles.val, styles.err)}>{v}</span>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      <div {...stylex.props(styles.block)}>
        <span {...stylex.props(styles.sectionLabel)}>last submit payload</span>
        <pre {...stylex.props(styles.pre)}>
          {lastSubmit
            ? JSON.stringify(lastSubmit, null, 2)
            : '— (submit the form to capture)'}
        </pre>
      </div>

      <Text type="supporting" color="secondary">
        State is observed from the rendered Astryx inputs (value, aria-invalid,
        status message), so it is uniform across all four frameworks.
      </Text>
    </div>
  );
}
