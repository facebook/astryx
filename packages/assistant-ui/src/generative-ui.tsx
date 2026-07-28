// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file generative-ui.tsx
 * @input Uses react-generative-ui schemas/actions and Astryx presentation primitives
 * @output Exports an Astryx-rendered, closed 27-component generative UI library
 * @position Optional generative UI adapter for @astryxdesign/assistant-ui
 *
 * The upstream schemas remain authoritative. Only their render functions are
 * replaced, so model-visible component names and property validation stay
 * compatible while the rendered UI uses Astryx components and tokens.
 */

import {Children, useState, type FormEvent} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  defaultGenerativeUILibrary,
  type GenerativeUIAction,
  type GenerativeUIDispatch,
  type GenerativeUILibrary,
} from '@assistant-ui/react-generative-ui';
import {Badge, type BadgeVariant} from '@astryxdesign/core/Badge';
import {Banner, type BannerStatus} from '@astryxdesign/core/Banner';
import {Button, type ButtonVariant} from '@astryxdesign/core/Button';
import {Card, type CardVariant} from '@astryxdesign/core/Card';
import {Carousel} from '@astryxdesign/core/Carousel';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {DateInput} from '@astryxdesign/core/DateInput';
import {Divider} from '@astryxdesign/core/Divider';
import {Heading} from '@astryxdesign/core/Heading';
import {HStack} from '@astryxdesign/core/HStack';
import {Icon, type IconName} from '@astryxdesign/core/Icon';
import {Item} from '@astryxdesign/core/Item';
import {List, ListItem} from '@astryxdesign/core/List';
import {Markdown} from '@astryxdesign/core/Markdown';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {RadioList, RadioListItem} from '@astryxdesign/core/RadioList';
import {Table, proportional} from '@astryxdesign/core/Table';
import {Text} from '@astryxdesign/core/Text';
import {TextArea} from '@astryxdesign/core/TextArea';
import {TextInput} from '@astryxdesign/core/TextInput';
import {VStack} from '@astryxdesign/core/VStack';
import {colorVars, radiusVars} from '@astryxdesign/core/theme/tokens.stylex';
import type {ISODateString} from '@astryxdesign/core/Calendar';
import {Select} from './primitives';

type SpacingStep = 0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10;

interface GenerativeOption {
  label: string;
  value: string;
}

type GenerativeCell = string | number | boolean;

interface GenerativeColumn {
  label: string;
}

interface GenerativePoint {
  label?: string;
  value: number;
}

interface GenerativeSeries {
  label?: string;
  data: GenerativePoint[];
}

const styles = stylex.create({
  form: {
    margin: 0,
  },
  image: {
    display: 'block',
    maxWidth: '100%',
    height: 'auto',
  },
  imageRound: {
    borderRadius: radiusVars['--radius-full'],
    objectFit: 'cover',
    aspectRatio: '1',
  },
  box: {
    minWidth: 0,
  },
  boxRound: {
    borderRadius: radiusVars['--radius-full'],
    overflow: 'clip',
  },
  boxMuted: {
    backgroundColor: colorVars['--color-background-muted'],
  },
  boxBlue: {
    backgroundColor: colorVars['--color-background-blue'],
  },
  boxGreen: {
    backgroundColor: colorVars['--color-background-green'],
  },
  boxOrange: {
    backgroundColor: colorVars['--color-background-orange'],
  },
  boxPurple: {
    backgroundColor: colorVars['--color-background-purple'],
  },
  spacer: {
    flex: 1,
  },
});

const dynamicStyles = stylex.create({
  imageSize: (size: number) => ({
    width: size,
    height: size,
  }),
  imageMaxWidth: (size: number) => ({
    maxWidth: size,
  }),
  boxSize: (width: string | number | null, height: string | number | null) => ({
    width,
    height,
  }),
});

const GAP_STEPS: readonly SpacingStep[] = [0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8];

function toGap(value: number | undefined): SpacingStep {
  if (value == null) {
    return 2;
  }
  return GAP_STEPS.reduce((closest, step) =>
    Math.abs(step - value) < Math.abs(closest - value) ? step : closest,
  );
}

function fireAction(
  action: GenerativeUIAction | undefined,
  dispatch: GenerativeUIDispatch | undefined,
  input?: unknown,
) {
  if (action == null || dispatch == null) {
    return;
  }
  const payload = input === undefined ? action : {...action, $input: input};
  Promise.resolve(dispatch(payload)).catch(error => {
    queueMicrotask(() => {
      throw error;
    });
  });
}

function collectFormValues(form: HTMLFormElement) {
  const result: Record<string, FormDataEntryValue | FormDataEntryValue[]> = {};
  for (const [name, value] of new FormData(form)) {
    const current = result[name];
    if (current === undefined) {
      result[name] = value;
    } else if (Array.isArray(current)) {
      current.push(value);
    } else {
      result[name] = [current, value];
    }
  }
  return result;
}

function actionFormSubmit(
  event: FormEvent<HTMLFormElement>,
  action: GenerativeUIAction | undefined,
  dispatch: GenerativeUIDispatch | undefined,
) {
  event.preventDefault();
  fireAction(action, dispatch, collectFormValues(event.currentTarget));
}

function buttonVariant(
  value: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | undefined,
): ButtonVariant {
  if (value === 'danger') {
    return 'destructive';
  }
  if (value === 'outline') {
    return 'secondary';
  }
  return value ?? 'primary';
}

function badgeVariant(value: string | undefined): BadgeVariant {
  const supported: readonly BadgeVariant[] = [
    'neutral',
    'info',
    'success',
    'warning',
    'error',
    'blue',
    'cyan',
    'green',
    'orange',
    'pink',
    'purple',
    'red',
    'teal',
    'yellow',
  ];
  return supported.includes(value as BadgeVariant)
    ? (value as BadgeVariant)
    : 'neutral';
}

function cardVariant(value: string | undefined): CardVariant {
  const normalized = value?.trim().toLowerCase();
  const supported: readonly CardVariant[] = [
    'muted',
    'blue',
    'cyan',
    'gray',
    'green',
    'orange',
    'pink',
    'purple',
    'red',
    'teal',
    'yellow',
  ];
  return supported.includes(normalized as CardVariant)
    ? (normalized as CardVariant)
    : 'default';
}

function boxBackground(value: string | undefined) {
  switch (value?.trim().toLowerCase()) {
    case 'blue':
      return styles.boxBlue;
    case 'green':
      return styles.boxGreen;
    case 'orange':
      return styles.boxOrange;
    case 'purple':
      return styles.boxPurple;
    case 'muted':
    case 'gray':
      return styles.boxMuted;
    default:
      return null;
  }
}

const GENERATIVE_ICON_MAP: Record<string, IconName> = {
  sun: 'info',
  moon: 'info',
  cloud: 'info',
  rain: 'info',
  snow: 'info',
  wind: 'info',
  play: 'arrowUp',
  pause: 'stop',
  check: 'check',
  x: 'close',
  star: 'info',
  heart: 'info',
  'arrow-right': 'chevronRight',
  'arrow-up-right': 'externalLink',
  'chevron-right': 'chevronRight',
  calendar: 'calendar',
  clock: 'clock',
  'map-pin': 'info',
  plane: 'arrowUp',
  truck: 'info',
  'credit-card': 'info',
  user: 'info',
  search: 'search',
  bell: 'info',
};

/**
 * Astryx renderers for every component in react-generative-ui's default
 * closed vocabulary. Arbitrary model-provided colors and radii are reduced to
 * a small semantic allowlist rather than becoming unchecked inline CSS.
 */
export const astryxGenerativeUILibrary = {
  ...defaultGenerativeUILibrary,
  Header: {
    ...defaultGenerativeUILibrary.Header,
    render: ({text, size, children}) => (
      <Heading level={2} type={size === '3xl' ? 'display-3' : undefined}>
        {text}
        {children}
      </Heading>
    ),
  },
  Text: {
    ...defaultGenerativeUILibrary.Text,
    render: ({value, size, weight, color, children}) => (
      <Text
        color={color === 'secondary' ? 'secondary' : 'inherit'}
        display="inline"
        size={size === 'md' ? 'base' : size}
        weight={weight}>
        {value}
        {children}
      </Text>
    ),
  },
  Caption: {
    ...defaultGenerativeUILibrary.Caption,
    render: ({value, children}) => (
      <Text color="secondary" display="block" type="supporting">
        {value}
        {children}
      </Text>
    ),
  },
  Image: {
    ...defaultGenerativeUILibrary.Image,
    render: ({src, alt, size, round}) => (
      <img
        {...stylex.props(
          styles.image,
          round && styles.imageRound,
          typeof size === 'number' &&
            (round
              ? dynamicStyles.imageSize(size)
              : dynamicStyles.imageMaxWidth(size)),
        )}
        alt={alt}
        src={src}
      />
    ),
  },
  Divider: {
    ...defaultGenerativeUILibrary.Divider,
    render: ({flush}) => <Divider isFullBleed={flush} />,
  },
  Fact: {
    ...defaultGenerativeUILibrary.Fact,
    render: ({label, value, children}) => (
      <Item
        density="compact"
        description={label}
        endContent={children}
        label={value}
      />
    ),
  },
  Button: {
    ...defaultGenerativeUILibrary.Button,
    render: ({
      label,
      buttonStyle: variant,
      block,
      submit,
      $action,
      $dispatch,
      children,
    }) => (
      <Button
        label={label}
        onClick={submit ? undefined : () => fireAction($action, $dispatch)}
        type={submit ? 'submit' : 'button'}
        variant={buttonVariant(variant)}
        width={block ? '100%' : undefined}>
        <>
          {label}
          {children}
        </>
      </Button>
    ),
  },
  Select: {
    ...defaultGenerativeUILibrary.Select,
    render: ({options, placeholder, label, name, $action, $dispatch}) => {
      const [value, setValue] = useState<string>();
      return (
        <>
          <Select
            htmlName={name}
            label={label ?? placeholder ?? 'Select an option'}
            onValueChange={nextValue => {
              setValue(nextValue);
              fireAction($action, $dispatch, nextValue);
            }}
            options={options}
            value={value}
          />
        </>
      );
    },
  },
  Input: {
    ...defaultGenerativeUILibrary.Input,
    render: ({placeholder, multiline, label, name, $action, $dispatch}) => {
      const [value, setValue] = useState('');
      const commonProps = {
        htmlName: name,
        isLabelHidden: label == null,
        label: label ?? 'Text input',
        onChange: setValue,
        placeholder,
        value,
        width: '100%',
      } as const;
      return multiline ? (
        <TextArea
          {...commonProps}
          onKeyDown={event => {
            if (
              event.key === 'Enter' &&
              (event.ctrlKey || event.metaKey) &&
              !event.nativeEvent.isComposing &&
              event.currentTarget.closest('form') == null
            ) {
              fireAction($action, $dispatch, value);
            }
          }}
        />
      ) : (
        <TextInput
          {...commonProps}
          onKeyDown={event => {
            if (
              event.key === 'Enter' &&
              !event.nativeEvent.isComposing &&
              event.currentTarget.closest('form') == null
            ) {
              fireAction($action, $dispatch, value);
            }
          }}
        />
      );
    },
  },
  DatePicker: {
    ...defaultGenerativeUILibrary.DatePicker,
    render: ({
      value: initialValue,
      min,
      max,
      label,
      name,
      $action,
      $dispatch,
    }) => {
      const [value, setValue] = useState<ISODateString | undefined>(
        initialValue as ISODateString | undefined,
      );
      return (
        <>
          <DateInput
            isLabelHidden={label == null}
            label={label ?? 'Date'}
            max={max as ISODateString | undefined}
            min={min as ISODateString | undefined}
            onChange={nextValue => {
              setValue(nextValue);
              fireAction($action, $dispatch, nextValue);
            }}
            value={value}
          />
          {name != null && (
            <input name={name} type="hidden" value={value ?? ''} />
          )}
        </>
      );
    },
  },
  Checkbox: {
    ...defaultGenerativeUILibrary.Checkbox,
    render: ({label, name, defaultChecked, $action, $dispatch}) => {
      const [value, setValue] = useState(defaultChecked ?? false);
      return (
        <CheckboxInput
          htmlName={name}
          label={label}
          onChange={nextValue => {
            setValue(nextValue);
            fireAction($action, $dispatch, nextValue);
          }}
          value={value}
        />
      );
    },
  },
  RadioGroup: {
    ...defaultGenerativeUILibrary.RadioGroup,
    render: ({options, name, label, defaultValue, $action, $dispatch}) => {
      const [value, setValue] = useState(defaultValue ?? '');
      return (
        <RadioList
          htmlName={name}
          isLabelHidden={label == null}
          label={label ?? 'Choose an option'}
          onChange={nextValue => {
            setValue(nextValue);
            fireAction($action, $dispatch, nextValue);
          }}
          value={value}>
          {(options as GenerativeOption[]).map(option => (
            <RadioListItem
              key={option.value}
              label={option.label}
              value={option.value}
            />
          ))}
        </RadioList>
      );
    },
  },
  Form: {
    ...defaultGenerativeUILibrary.Form,
    render: ({gap, $action, $dispatch, children}) => (
      <form
        {...stylex.props(styles.form)}
        onSubmit={event => actionFormSubmit(event, $action, $dispatch)}>
        <VStack gap={toGap(gap)}>{children}</VStack>
      </form>
    ),
  },
  Card: {
    ...defaultGenerativeUILibrary.Card,
    render: ({
      title,
      padding,
      background,
      asForm,
      confirm,
      cancel,
      $dispatch,
      children,
    }) => {
      const content = (
        <Card padding={toGap(padding)} variant={cardVariant(background)}>
          <VStack gap={3}>
            {title != null && <Heading level={3}>{title}</Heading>}
            {children}
            {(confirm != null || cancel != null) && (
              <HStack gap={2} justify="end">
                {cancel != null && (
                  <Button
                    label={cancel.label}
                    onClick={() => fireAction(cancel.$action, $dispatch)}
                    variant="secondary"
                  />
                )}
                {confirm != null && (
                  <Button
                    label={confirm.label}
                    onClick={
                      asForm
                        ? undefined
                        : () => fireAction(confirm.$action, $dispatch)
                    }
                    type={asForm ? 'submit' : 'button'}
                  />
                )}
              </HStack>
            )}
          </VStack>
        </Card>
      );
      return asForm ? (
        <form
          {...stylex.props(styles.form)}
          onSubmit={event =>
            actionFormSubmit(event, confirm?.$action, $dispatch)
          }>
          {content}
        </form>
      ) : (
        content
      );
    },
  },
  Col: {
    ...defaultGenerativeUILibrary.Col,
    render: ({gap, align, children}) => (
      <VStack align={align} gap={toGap(gap)}>
        {children}
      </VStack>
    ),
  },
  Row: {
    ...defaultGenerativeUILibrary.Row,
    render: ({gap, align, justify, children}) => (
      <HStack align={align} gap={toGap(gap)} justify={justify}>
        {children}
      </HStack>
    ),
  },
  Spacer: {
    ...defaultGenerativeUILibrary.Spacer,
    render: () => <span aria-hidden="true" {...stylex.props(styles.spacer)} />,
  },
  Badge: {
    ...defaultGenerativeUILibrary.Badge,
    render: ({value, variant, children}) => (
      <Badge
        label={
          <>
            {value}
            {children}
          </>
        }
        variant={badgeVariant(variant)}
      />
    ),
  },
  Box: {
    ...defaultGenerativeUILibrary.Box,
    render: ({width, height, radius, background, children}) => (
      <div
        {...stylex.props(
          styles.box,
          dynamicStyles.boxSize(width ?? null, height ?? null),
          radius === 'full' && styles.boxRound,
          boxBackground(background),
        )}>
        {children}
      </div>
    ),
  },
  ListView: {
    ...defaultGenerativeUILibrary.ListView,
    render: ({children}) => <List density="compact">{children}</List>,
  },
  ListViewItem: {
    ...defaultGenerativeUILibrary.ListViewItem,
    render: ({$action, $dispatch, children}) => (
      <ListItem
        label={children ?? ''}
        onClick={
          $action != null && $dispatch != null
            ? () => fireAction($action, $dispatch)
            : undefined
        }
      />
    ),
  },
  Table: {
    ...defaultGenerativeUILibrary.Table,
    render: ({columns = [], rows = []}) => {
      const typedRows = rows as GenerativeCell[][];
      const explicitColumns = columns as GenerativeColumn[];
      const inferredColumnCount = Math.max(
        0,
        ...typedRows.map(row => row.length),
      );
      const typedColumns =
        explicitColumns.length > 0
          ? explicitColumns
          : Array.from({length: inferredColumnCount}, (_, index) => ({
              label: `Column ${index + 1}`,
            }));
      const data = typedRows.map((row, rowIndex) => ({
        id: rowIndex,
        ...Object.fromEntries(
          row.map((cell, columnIndex) => [
            `column-${columnIndex}`,
            String(cell),
          ]),
        ),
      }));
      return (
        <Table
          columns={typedColumns.map((column, columnIndex) => ({
            header: column.label,
            key: `column-${columnIndex}`,
            width: proportional(1),
          }))}
          data={data}
          density="compact"
          dividers="grid"
        />
      );
    },
  },
  Markdown: {
    ...defaultGenerativeUILibrary.Markdown,
    render: ({value}) => <Markdown>{value ?? ''}</Markdown>,
  },
  Chart: {
    ...defaultGenerativeUILibrary.Chart,
    render: ({data = [], series = []}) => {
      const typedData = data as GenerativePoint[];
      const typedSeries = series as GenerativeSeries[];
      const chartSeries =
        typedSeries.length > 0
          ? typedSeries
          : [{label: undefined, data: typedData}];
      const max = Math.max(
        0,
        ...chartSeries.flatMap(item => item.data.map(point => point.value)),
      );
      return (
        <VStack gap={2}>
          {chartSeries.flatMap((item, seriesIndex) =>
            item.data.map((point, pointIndex) => (
              <ProgressBar
                key={`${seriesIndex}-${pointIndex}`}
                hasValueLabel
                label={point.label ?? item.label ?? `Point ${pointIndex + 1}`}
                max={max}
                value={point.value}
              />
            )),
          )}
        </VStack>
      );
    },
  },
  Alert: {
    ...defaultGenerativeUILibrary.Alert,
    render: ({title, description, tone = 'info', children}) => {
      const status: BannerStatus = tone === 'danger' ? 'error' : tone;
      return (
        <Banner
          description={description}
          status={status}
          title={title ?? description ?? 'Notice'}>
          {children}
        </Banner>
      );
    },
  },
  Carousel: {
    ...defaultGenerativeUILibrary.Carousel,
    render: ({label, children}) => (
      <Carousel aria-label={label} hasSnap>
        {Children.toArray(children).slice(0, 10)}
      </Carousel>
    ),
  },
  Icon: {
    ...defaultGenerativeUILibrary.Icon,
    render: ({name, size}) => (
      <Icon
        icon={GENERATIVE_ICON_MAP[name] ?? 'info'}
        size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
      />
    ),
  },
} satisfies GenerativeUILibrary;

export type AstryxGenerativeUIComponentName =
  keyof typeof astryxGenerativeUILibrary;

export const ASTRYX_GENERATIVE_UI_COMPONENTS = Object.freeze(
  Object.keys(astryxGenerativeUILibrary),
) as readonly AstryxGenerativeUIComponentName[];
