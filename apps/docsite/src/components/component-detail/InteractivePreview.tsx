// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {
  createElement,
  useMemo,
  useState,
  useCallback,
  isValidElement,
  Component,
  type ReactNode,
} from 'react';
import {getXDSComponent} from './resolveElements';
import {XDSButton} from '@xds/core/Button';
import {XDSCard} from '@xds/core/Card';
import {XDSCenter} from '@xds/core/Center';
import {CodeExampleBlock} from '../CodeExampleBlock';
import {XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {Code} from 'lucide-react';
import {ComponentPreviewTheme} from './ComponentPreviewTheme';
import {
  buildInitialState,
  getMissingRequiredProps,
  pickPrimaryProps,
} from './interactiveState';
import type {
  PropDoc,
  PlaygroundConfig,
} from '../../generated/componentRegistry';

export type {KnobProp} from './interactiveState';

class PreviewErrorBoundary extends Component<
  {children: ReactNode; resetKeys: unknown[]},
  {error: Error | null}
> {
  state = {error: null as Error | null};
  static getDerivedStateFromError(error: Error) {
    return {error};
  }
  componentDidUpdate(prevProps: {resetKeys: unknown[]}) {
    if (
      this.state.error &&
      prevProps.resetKeys.some((k, i) => !Object.is(k, this.props.resetKeys[i]))
    ) {
      this.setState({error: null});
    }
  }
  render() {
    if (this.state.error) {
      return (
        <XDSText type="supporting" color="secondary">
          Render error: {this.state.error.message}
        </XDSText>
      );
    }
    return this.props.children;
  }
}

function toIdentifierName(name: string): string {
  return name
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part, index) => {
      const lower = part.charAt(0).toLowerCase() + part.slice(1);
      if (index === 0) {
        return lower;
      }
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join('');
}

function formatValue(
  value: unknown,
  propName?: string,
  componentName?: string,
): string {
  if (value === undefined) {
    return 'undefined';
  }
  if (value === null) {
    return 'null';
  }
  if (
    value != null &&
    typeof value === 'object' &&
    'name' in value &&
    typeof value.name === 'string' &&
    propName === 'theme'
  ) {
    const identifier = toIdentifierName(value.name);
    return componentName === 'Theme' ? `${identifier}Theme` : identifier;
  }
  if (typeof value === 'string') {
    return `"${value}"`;
  }
  if (typeof value === 'boolean' || typeof value === 'number') {
    return String(value);
  }
  if (isValidElement(value)) {
    const el = value as React.ReactElement<Record<string, unknown>>;
    const type =
      typeof el.type === 'string'
        ? el.type
        : ((el.type as {displayName?: string}).displayName ??
          el.type.name ??
          'Component');
    const props = el.props;
    if (!props || Object.keys(props).length === 0) {
      return `<${type} />`;
    }
    const propStr = Object.entries(props)
      .filter(([k]) => k !== 'children')
      .map(([k, v]) => {
        if (typeof v === 'string') {
          return `${k}="${v}"`;
        }
        return `${k}={${JSON.stringify(v)}}`;
      })
      .join(' ');
    return `<${type} ${propStr} />`;
  }
  return JSON.stringify(value);
}

function generateCode(name: string, state: Record<string, unknown>): string {
  const componentName = `XDS${name}`;
  // Filter out docs-only props that shouldn't appear in user code
  const entries = Object.entries(state).filter(
    ([k, v]) => v !== undefined && k !== 'isInline',
  );

  if (entries.length === 0) {
    return `<${componentName} />`;
  }

  const propLines = entries.map(([key, value]) => {
    if (typeof value === 'boolean' && value === true) {
      return `  ${key}`;
    }
    if (typeof value === 'string') {
      return `  ${key}="${value}"`;
    }
    return `  ${key}={${formatValue(value, key, name)}}`;
  });

  return `<${componentName}\n${propLines.join('\n')}\n/>`;
}

export function useInteractiveState(
  name: string,
  props: PropDoc[],
  playground?: PlaygroundConfig | null,
) {
  const knobs = useMemo(() => pickPrimaryProps(name, props), [name, props]);
  const initialState = useMemo(
    () => buildInitialState(knobs, playground),
    [knobs, playground],
  );
  const [state, setState] = useState<Record<string, unknown>>(initialState);
  const missingRequiredProps = useMemo(
    () => getMissingRequiredProps(knobs, initialState),
    [knobs, initialState],
  );

  const setProp = useCallback(
    (propName: string, value: unknown) =>
      setState(prev => ({...prev, [propName]: value})),
    [],
  );

  const reset = useCallback(() => setState(initialState), [initialState]);

  const isDirty = useMemo(
    () => Object.keys(state).some(k => !Object.is(state[k], initialState[k])),
    [state, initialState],
  );

  return {knobs, state, setProp, reset, isDirty, missingRequiredProps};
}

export function InteractivePreviewStage({
  name,
  state,
  missingRequiredProps = [],
}: {
  name: string;
  state: Record<string, unknown>;
  missingRequiredProps?: string[];
}) {
  const [showCode, setShowCode] = useState(false);
  const Component = getXDSComponent(name);

  if (missingRequiredProps.length > 0) {
    return (
      <ComponentPreviewTheme>
        <XDSCard variant="muted" padding={0}>
          <XDSCenter style={{minHeight: 200, width: '100%'}}>
            <XDSVStack
              gap={1}
              style={{
                paddingBlock: 24,
                paddingInline: 16,
                textAlign: 'center',
              }}>
              <XDSText type="supporting" color="secondary">
                Interactive preview needs required props that cannot be
                generated automatically.
              </XDSText>
              <XDSText type="supporting" color="secondary">
                Missing: {missingRequiredProps.join(', ')}
              </XDSText>
            </XDSVStack>
          </XDSCenter>
        </XDSCard>
      </ComponentPreviewTheme>
    );
  }

  if (!Component) {
    return (
      <ComponentPreviewTheme>
        <XDSCard variant="muted" padding={0}>
          <XDSCenter style={{minHeight: 200, width: '100%'}}>
            <XDSVStack
              gap={1}
              style={{
                paddingBlock: 24,
                paddingInline: 16,
                textAlign: 'center',
              }}>
              <XDSText type="supporting" color="secondary">
                Interactive preview not available for {name}.
              </XDSText>
              <XDSText type="supporting" color="secondary">
                This component is not part of @xds/core.
              </XDSText>
            </XDSVStack>
          </XDSCenter>
        </XDSCard>
      </ComponentPreviewTheme>
    );
  }

  const code = generateCode(name, state);

  return (
    <ComponentPreviewTheme>
      <XDSCard
        variant="muted"
        padding={0}
        style={{width: '100%', position: 'relative'}}>
        <div
          style={{
            position: 'absolute',
            top: 'var(--spacing-2)',
            right: 'var(--spacing-2)',
            zIndex: 2,
          }}>
          <XDSButton
            label="Show code"
            tooltip="Show code"
            icon={<Code size={16} />}
            isIconOnly
            variant={showCode ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setShowCode(v => !v)}
          />
        </div>
        {showCode ? (
          <div
            style={{
              minHeight: 200,
              overflow: 'auto',
              paddingRight: 'var(--spacing-8)',
            }}>
            <CodeExampleBlock
              code={code}
              language="tsx"
              hasCopyButton
              container="section"
              width="100%"
            />
          </div>
        ) : (
          <XDSCenter
            style={{
              minHeight: 200,
              width: '100%',
              padding: 'var(--spacing-4)',
            }}>
            <PreviewErrorBoundary resetKeys={[Component, state]}>
              {createElement(Component, state)}
            </PreviewErrorBoundary>
          </XDSCenter>
        )}
      </XDSCard>
    </ComponentPreviewTheme>
  );
}
