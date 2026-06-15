// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file PropertyPanel.tsx
 * @input Current editor code + onCodeChange callback
 * @output Component selector + instance picker + literal-bound prop knobs
 * @position Playground left panel — "Property" tab.
 *
 * Parses the code, lists the XDS components used, and renders the docs-style
 * props table for the selected component instance. Changing a knob performs a
 * targeted source-range edit (see babelParser) and writes back through
 * onCodeChange — so edits flow into Monaco and the live preview. Only literal
 * props (boolean / enum / string / number) are editable; enum controls preserve
 * typed option values for mixed literal unions. Props set to an expression are
 * shown read-only ("set in code") to avoid clobbering.
 */

'use client';

import {useEffect, useMemo, useRef, useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSSelector} from '@xds/core/Selector';
import {XDSLink} from '@xds/core/Link';
import {XDSSwitch} from '@xds/core/Switch';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSNumberInput} from '@xds/core/NumberInput';
import {XDSDivider} from '@xds/core/Divider';
import {XDSEmptyState} from '@xds/core/EmptyState';
import {XDSDropdownMenu} from '@xds/core/DropdownMenu';
// SegmentedControl removed — targeting selects the exact instance.
import {ChevronDown} from 'lucide-react';
import {
  coerceDefault,
  coerceEnumOption,
  parsePropType,
  type PropControlDescriptor,
} from '../../components/component-detail/parsePropType';
import type {PropDoc} from '../../generated/componentRegistry';
import {
  analyzeCode,
  formatAttr,
  removeAttribute,
  setAttribute,
  type AttrInfo,
  type InstanceInfo,
} from './babelParser';
import {getComponentByModule, getUsedComponents} from './usedComponents';

const NUMERIC_RE = /^-?\d+(\.\d+)?$/;

const s = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 0,
  },
  header: {
    flexShrink: 0,
    padding: 'var(--spacing-3) var(--spacing-3) var(--spacing-2)',
  },
  scroll: {
    flex: 1,
    minHeight: 0,
    overflow: 'auto',
    padding: 'var(--spacing-3)',
    paddingBlockStart: 0,
  },
  row: {
    paddingBlock: 'var(--spacing-2)',
  },
  control: {
    flexBasis: 160,
    flexShrink: 0,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  emptyWrap: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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

interface PropRowProps {
  prop: PropDoc;
  instance: InstanceInfo;
  code: string;
  onCodeChange: (code: string) => void;
  onRevealInCode?: (offset: number) => void;
}

function PropRow({
  prop,
  instance,
  code,
  onCodeChange,
  onRevealInCode,
}: PropRowProps) {
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
    if (attr && onRevealInCode) {
      const line = code.slice(0, attr.start).split('\n').length;
      controlEl = (
        <XDSLink
          href="#code"
          hasUnderline
          tooltip={`Go to line ${line}`}
          onClick={e => {
            e.preventDefault();
            onRevealInCode(attr.start);
          }}>
          <XDSText type="supporting">set in code</XDSText>
        </XDSLink>
      );
    } else {
      controlEl = (
        <XDSText type="supporting" color={attr ? 'secondary' : 'disabled'}>
          {attr ? 'set in code' : '—'}
        </XDSText>
      );
    }
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
      />
    );
  }

  return (
    <div {...stylex.props(s.row)}>
      <XDSHStack gap={3} vAlign="start">
        <div style={{flex: 1, minWidth: 0}}>
          <XDSText type="body" weight="bold">
            {prop.name}
          </XDSText>
          <XDSText type="code" color="secondary" display="block">
            {prop.type}
          </XDSText>
        </div>
        <div {...stylex.props(s.control)}>{controlEl}</div>
      </XDSHStack>
    </div>
  );
}

interface ExternalSelection {
  component: string;
  instanceIndex: number;
}

interface PropertyPanelProps {
  code: string;
  onCodeChange: (code: string) => void;
  onRevealInCode?: (offset: number) => void;
  onFlashInstance?: (component: string, index: number) => void;
  /** Driven by the targeting system — overrides the current selection once. */
  externalSelection?: ExternalSelection;
  onExternalSelectionConsumed?: () => void;
}

export function PropertyPanel({
  code,
  onCodeChange,
  onRevealInCode,
  onFlashInstance,
  externalSelection,
  onExternalSelectionConsumed,
}: PropertyPanelProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [instanceIndex, setInstanceIndex] = useState(0);
  const lastInstances = useRef<InstanceInfo[]>([]);

  // Re-parse on every code change; keep the last good parse on syntax errors.
  const instances = useMemo(() => {
    const parsed = analyzeCode(code);
    if (parsed != null) {
      lastInstances.current = parsed;
      return parsed;
    }
    return lastInstances.current;
  }, [code]);

  const used = useMemo(() => getUsedComponents(instances), [instances]);

  // Keep selection valid as the code changes.
  useEffect(() => {
    if (used.length === 0) {
      if (selected !== null) {
        setSelected(null);
      }
      return;
    }
    if (selected == null || !used.some(u => u.module === selected)) {
      setSelected(used[0].module);
      setInstanceIndex(0);
    }
  }, [used, selected]);

  const componentInstances = useMemo(
    () => instances.filter(i => i.component === selected),
    [instances, selected],
  );

  // Clamp instance index when the count shrinks.
  useEffect(() => {
    if (instanceIndex > 0 && instanceIndex >= componentInstances.length) {
      setInstanceIndex(Math.max(0, componentInstances.length - 1));
    }
  }, [componentInstances, instanceIndex]);

  // Apply external selection from the targeting system.
  useEffect(() => {
    if (!externalSelection) {
      return;
    }
    const {component, instanceIndex: idx} = externalSelection;
    if (used.some(u => u.module === component)) {
      setSelected(component);
      setInstanceIndex(idx);
    }
    onExternalSelectionConsumed?.();
  }, [externalSelection, used, onExternalSelectionConsumed]);

  if (used.length === 0) {
    return (
      <div {...stylex.props(s.emptyWrap)}>
        <XDSEmptyState
          title="No components detected"
          description="Add a component in the Code tab to view properties."
          isCompact
        />
      </div>
    );
  }

  const entry = selected ? getComponentByModule(selected) : undefined;
  const targetInstance =
    componentInstances[Math.min(instanceIndex, componentInstances.length - 1)];
  const props = entry?.props ?? [];
  const required = props.filter(p => p.required);
  const optional = props.filter(p => !p.required);

  const selectedLabel =
    used.find(u => u.module === selected)?.label ?? selected;

  const menuItems =
    used.length > 1
      ? used.map(u => ({
          label: u.count > 1 ? `${u.label} (${u.count})` : u.label,
          onClick: () => {
            setSelected(u.module);
            setInstanceIndex(0);
            onFlashInstance?.(u.module, 0);
          },
        }))
      : [];

  return (
    <div {...stylex.props(s.root)}>
      <div {...stylex.props(s.header)}>
        <XDSVStack gap={2}>
          <XDSHStack gap={0} vAlign="center">
            <XDSHeading level={3}>{selectedLabel}</XDSHeading>
            {menuItems.length > 0 && (
              <XDSDropdownMenu
                button={{
                  label: 'Switch component',
                  tooltip: 'Switch component',
                  variant: 'ghost',
                  size: 'sm',
                  isIconOnly: true,
                  icon: <ChevronDown size={16} />,
                }}
                hasChevron={false}
                items={menuItems}
              />
            )}
          </XDSHStack>
        </XDSVStack>
      </div>

      <div {...stylex.props(s.scroll)}>
        {!entry ? (
          <XDSText type="supporting" color="secondary">
            {selected} is not part of @xds/core — no editable props.
          </XDSText>
        ) : props.length === 0 ? (
          <XDSText type="supporting" color="secondary">
            {entry.displayName} has no documented props.
          </XDSText>
        ) : targetInstance == null ? null : (
          <XDSVStack gap={1}>
            {required.length > 0 && (
              <>
                <XDSHeading level={5} color="secondary">
                  Required
                </XDSHeading>
                {required.map(prop => (
                  <div key={prop.name}>
                    <XDSDivider />
                    <PropRow
                      prop={prop}
                      instance={targetInstance}
                      code={code}
                      onCodeChange={onCodeChange}
                      onRevealInCode={onRevealInCode}
                    />
                  </div>
                ))}
              </>
            )}
            {optional.length > 0 && (
              <>
                <XDSHeading
                  level={5}
                  color="secondary"
                  style={{marginTop: 'var(--spacing-2)'}}>
                  Optional
                </XDSHeading>
                {optional.map(prop => (
                  <div key={prop.name}>
                    <XDSDivider />
                    <PropRow
                      prop={prop}
                      instance={targetInstance}
                      code={code}
                      onCodeChange={onCodeChange}
                      onRevealInCode={onRevealInCode}
                    />
                  </div>
                ))}
              </>
            )}
          </XDSVStack>
        )}
      </div>
    </div>
  );
}
