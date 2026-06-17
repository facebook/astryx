// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file PropertyEditor.tsx
 * @input Current editor code + the selected instance + onCodeChange callback
 * @output Literal-bound prop knobs for one component instance + "Apply" footer
 * @position Playground in-preview "Properties" popover (anchored to the selection badge).
 *
 * Parses the code and renders the docs-style props table for the externally
 * selected component instance. Changing a knob performs a targeted source-range
 * edit (see componentInstances) against a local draft; edits are buffered and only
 * written back through onCodeChange when the user clicks "Apply" (pinned at the
 * bottom of the popover, outside the scroll area). Only literal props (boolean /
 * enum / string / number) are editable; enum controls preserve typed option
 * values for mixed literal unions. Props set to an expression are shown
 * read-only ("set in code") to avoid clobbering.
 */

'use client';

import {useEffect, useMemo, useRef, useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSLayout, XDSLayoutContent, XDSLayoutFooter} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {XDSSelector} from '@xds/core/Selector';
import {XDSSwitch} from '@xds/core/Switch';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSNumberInput} from '@xds/core/NumberInput';
import {XDSEmptyState} from '@xds/core/EmptyState';
import {XDSList, XDSListItem} from '@xds/core/List';
import {XDSCenter} from '@xds/core/Center';
import {XDSButton} from '@xds/core/Button';
import {
  coerceDefault,
  coerceEnumOption,
  parsePropType,
  type PropControlDescriptor,
} from '../../../components/component-detail/parsePropType';
import type {PropDoc} from '../../../generated/componentRegistry';
import {
  analyzeCode,
  formatAttr,
  removeAttribute,
  setAttribute,
  type AttrInfo,
  type InstanceInfo,
} from './componentInstances';
import {getComponentByModule} from './componentLookup';

const NUMERIC_RE = /^-?\d+(\.\d+)?$/;

const s = stylex.create({
  // Cap the scrollable content area. The popover itself is unbounded, so the
  // footer always sits directly below the content, outside the scroll region.
  contentScroll: {
    maxHeight: 360,
  },
  applyBtn: {
    width: '100%',
  },
  inputControl: {
    width: 160,
  },
  emptyWrap: {
    flex: 1,
    padding: 'var(--spacing-6)',
  },
});

function isEditable(control: PropControlDescriptor, attr?: AttrInfo): boolean {
  if (attr?.valueKind === 'expression') {
    return false;
  }
  return (
    control.kind === 'boolean' ||
    control.kind === 'enum' ||
    control.kind === 'string' ||
    control.kind === 'number'
  );
}

// Prop types that have no inline control in the popover and so are
// hidden entirely (ReactNode parses to a string control but isn't meaningfully
// editable here; StyleXStyles/AriaRole have no control at all).
const UNSUPPORTED_PROP_TYPES = new Set([
  'ReactNode',
  'StyleXStyles',
  'AriaRole',
]);

/** Whether a prop can be edited through the editor (and should be shown). */
function isSupportedProp(prop: PropDoc): boolean {
  if (UNSUPPORTED_PROP_TYPES.has(prop.type.trim())) {
    return false;
  }
  return isEditable(parsePropType(prop.type, prop.name, prop.slotElements));
}

interface PropRowProps {
  prop: PropDoc;
  instance: InstanceInfo;
  code: string;
  onCodeChange: (code: string) => void;
}

function PropRow({prop, instance, code, onCodeChange}: PropRowProps) {
  const control = useMemo(
    () => parsePropType(prop.type, prop.name, prop.slotElements),
    [prop],
  );
  const attr = instance.attrs.find(a => a.name === prop.name);
  const editable = isEditable(control, attr);

  const commit = (
    kind: 'boolean' | 'string' | 'number' | 'enum',
    value: string | number | boolean,
  ) => {
    let next: string;
    if (kind === 'boolean') {
      next = value
        ? setAttribute(
            code,
            instance,
            prop.name,
            formatAttr(prop.name, 'boolean', true),
          )
        : removeAttribute(code, instance, prop.name);
    } else if (kind === 'string') {
      next =
        value === ''
          ? removeAttribute(code, instance, prop.name)
          : setAttribute(
              code,
              instance,
              prop.name,
              formatAttr(prop.name, 'string', value),
            );
    } else if (kind === 'number') {
      next = setAttribute(
        code,
        instance,
        prop.name,
        formatAttr(prop.name, 'number', value),
      );
    } else {
      const numeric =
        typeof value === 'number' || NUMERIC_RE.test(String(value));
      const attrKind =
        typeof value === 'boolean' ? 'boolean' : numeric ? 'number' : 'string';
      next = setAttribute(
        code,
        instance,
        prop.name,
        formatAttr(
          prop.name,
          attrKind,
          numeric && typeof value !== 'number' ? Number(value) : value,
        ),
      );
    }
    onCodeChange(next);
  };

  let controlEl: React.ReactNode;
  if (!editable) {
    controlEl = (
      <XDSText type="supporting" color={attr ? 'secondary' : 'disabled'}>
        {attr ? 'set in code' : '—'}
      </XDSText>
    );
  } else if (control.kind === 'boolean') {
    const checked = attr
      ? attr.value === true
      : coerceDefault(prop.default, control) === true;
    controlEl = (
      <XDSSwitch
        label={prop.name}
        isLabelHidden
        value={!!checked}
        onChange={next => commit('boolean', next)}
      />
    );
  } else if (control.kind === 'enum') {
    const def = coerceDefault(prop.default, control) as string | undefined;
    const value = String(attr?.value ?? def ?? control.options[0]);
    controlEl = (
      <XDSSelector
        label={prop.name}
        isLabelHidden
        size="sm"
        value={value}
        options={control.options}
        onChange={next => commit('enum', coerceEnumOption(control, next))}
        xstyle={s.inputControl}
      />
    );
  } else if (control.kind === 'string') {
    const value = typeof attr?.value === 'string' ? attr.value : '';
    controlEl = (
      <XDSTextInput
        label={prop.name}
        isLabelHidden
        placeholder="value"
        value={value}
        onChange={next => commit('string', next)}
        xstyle={s.inputControl}
      />
    );
  } else {
    const def = coerceDefault(prop.default, control) as number | undefined;
    const value = typeof attr?.value === 'number' ? attr.value : (def ?? 0);
    controlEl = (
      <XDSNumberInput
        label={prop.name}
        isLabelHidden
        value={value}
        onChange={next => commit('number', next)}
        xstyle={s.inputControl}
      />
    );
  }

  return (
    <XDSListItem
      label={
        <XDSText type="body" weight="bold">
          {prop.name}
        </XDSText>
      }
      endContent={controlEl}
    />
  );
}

interface ExternalSelection {
  component: string;
  instanceIndex: number;
}

interface PropertyEditorProps {
  code: string;
  onCodeChange: (code: string) => void;
  /** The component instance to edit (chosen via the in-preview selection). */
  externalSelection: ExternalSelection;
  /** Called after edits are flushed via "Apply" (e.g. to close the popover). */
  onApplied?: () => void;
}

export function PropertyEditor({
  code,
  onCodeChange,
  externalSelection,
  onApplied,
}: PropertyEditorProps) {
  const {component: selected, instanceIndex} = externalSelection;
  const lastInstances = useRef<InstanceInfo[]>([]);

  // Buffer prop edits locally; knobs mutate the draft and only take effect when
  // the user clicks "Apply". Re-sync whenever the upstream source changes (after
  // an Apply round-trips, or when the code is edited elsewhere).
  const [draft, setDraft] = useState(code);
  useEffect(() => {
    setDraft(code);
  }, [code]);
  const isDirty = draft !== code;
  const applyChanges = () => {
    if (isDirty) {
      onCodeChange(draft);
    }
    onApplied?.();
  };

  // Re-parse the draft on every change; keep the last good parse on syntax
  // errors.
  const instances = useMemo(() => {
    const parsed = analyzeCode(draft);
    if (parsed != null) {
      lastInstances.current = parsed;
      return parsed;
    }
    return lastInstances.current;
  }, [draft]);

  const componentInstances = useMemo(
    () => instances.filter(i => i.component === selected),
    [instances, selected],
  );

  if (instances.length === 0) {
    return (
      <XDSCenter xstyle={s.emptyWrap}>
        <XDSEmptyState
          title="No components detected"
          description="Add a component in the Code tab to view properties."
          isCompact
        />
      </XDSCenter>
    );
  }

  const entry = getComponentByModule(selected);
  const targetInstance =
    componentInstances[Math.min(instanceIndex, componentInstances.length - 1)];
  const props = entry?.props ?? [];
  const editableProps = props.filter(isSupportedProp);
  const required = editableProps.filter(p => p.required);
  const optional = editableProps.filter(p => !p.required);

  let body: React.ReactNode;
  if (!entry) {
    body = (
      <XDSText type="supporting" color="secondary">
        {selected} is not part of @xds/core — no editable props.
      </XDSText>
    );
  } else if (editableProps.length === 0) {
    body = (
      <XDSText type="supporting" color="secondary">
        {entry.displayName} has no editable props.
      </XDSText>
    );
  } else if (targetInstance == null) {
    body = null;
  } else {
    body = (
      <XDSList>
        {[...required, ...optional].map(prop => (
          <PropRow
            key={prop.name}
            prop={prop}
            instance={targetInstance}
            code={draft}
            onCodeChange={setDraft}
          />
        ))}
      </XDSList>
    );
  }

  return (
    <XDSLayout
      height="auto"
      content={
        <XDSLayoutContent padding={3} xstyle={s.contentScroll}>
          {body}
        </XDSLayoutContent>
      }
      footer={
        <XDSLayoutFooter hasDivider padding={3}>
          <XDSButton
            label="Apply"
            variant="primary"
            isDisabled={!isDirty}
            onClick={applyChanges}
            xstyle={s.applyBtn}
          />
        </XDSLayoutFooter>
      }
    />
  );
}
