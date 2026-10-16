// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file iconAdapters.tsx
 * @input A local capability contract, primitive library-prop mapper and supplied component
 * @output Stable IconType-compatible wrappers with opaque private adaptation metadata
 * @position Pure Icon authoring constructor; private dispatch is consumed only by iconResolution
 */
import React, {type ComponentType, type SVGProps} from 'react';
import type {IconType} from './Icon';
import {isIconComponent} from './iconComponentType';
import {
  admitsIconWeight,
  defineIconCapabilities,
  getOwnIconData,
  requireIconDataArray,
  requireRecord,
  type IconCapabilities,
  type IconContractAppearance,
  type IconContractSize,
  type IconContractWeight,
} from './iconCapabilities';

// Library drawing props are distinct from caller-owned HTML, form, accessibility,
// SVG box and engine props. Library appearance/weight and explicitly named size
// remain eligible; none of these names are forwarded to ordinary SVG components.
const reservedPropNames = [
  'icon',
  'label',
  'color',
  'capabilities',
  'resolveProps',
  'propNames',
  'state',
  'xstyle',
  'children',
  'ref',
  'key',
  'constructor',
  'prototype',
  '__proto__',
  'toString',
  'valueOf',
  'focusable',
  'dangerouslySetInnerHTML',
  'defaultChecked',
  'defaultValue',
  'suppressContentEditableWarning',
  'suppressHydrationWarning',
  'accessKey',
  'autoCapitalize',
  'autoFocus',
  'className',
  'contentEditable',
  'contextMenu',
  'dir',
  'draggable',
  'enterKeyHint',
  'hidden',
  'id',
  'lang',
  'nonce',
  'slot',
  'spellCheck',
  'style',
  'tabIndex',
  'title',
  'translate',
  'radioGroup',
  'role',
  'about',
  'content',
  'datatype',
  'inlist',
  'prefix',
  'property',
  'rel',
  'resource',
  'rev',
  'typeof',
  'vocab',
  'autoCorrect',
  'autoSave',
  'itemProp',
  'itemScope',
  'itemType',
  'itemID',
  'itemRef',
  'results',
  'security',
  'unselectable',
  'popover',
  'popoverTargetAction',
  'popoverTarget',
  'inert',
  'inputMode',
  'is',
  'exportparts',
  'part',
  'accept',
  'acceptCharset',
  'action',
  'allowFullScreen',
  'allowTransparency',
  'alt',
  'as',
  'async',
  'autoComplete',
  'autoPlay',
  'capture',
  'cellPadding',
  'cellSpacing',
  'charSet',
  'challenge',
  'checked',
  'cite',
  'classID',
  'cols',
  'colSpan',
  'controls',
  'coords',
  'crossOrigin',
  'data',
  'dateTime',
  'default',
  'defer',
  'disabled',
  'download',
  'encType',
  'form',
  'formAction',
  'formEncType',
  'formMethod',
  'formNoValidate',
  'formTarget',
  'frameBorder',
  'headers',
  'height',
  'high',
  'href',
  'hrefLang',
  'htmlFor',
  'httpEquiv',
  'integrity',
  'keyParams',
  'keyType',
  'kind',
  'list',
  'loop',
  'low',
  'manifest',
  'marginHeight',
  'marginWidth',
  'max',
  'maxLength',
  'media',
  'mediaGroup',
  'method',
  'min',
  'minLength',
  'multiple',
  'muted',
  'name',
  'noValidate',
  'open',
  'optimum',
  'pattern',
  'placeholder',
  'playsInline',
  'poster',
  'preload',
  'readOnly',
  'required',
  'reversed',
  'rows',
  'rowSpan',
  'sandbox',
  'scope',
  'scoped',
  'scrolling',
  'seamless',
  'selected',
  'shape',
  'sizes',
  'span',
  'src',
  'srcDoc',
  'srcLang',
  'srcSet',
  'start',
  'step',
  'summary',
  'target',
  'type',
  'useMap',
  'value',
  'width',
  'wmode',
  'wrap',
] as const;
type ReservedPropName = Lowercase<(typeof reservedPropNames)[number]>;
type DeniedPropName =
  | ReservedPropName
  | `aria${string}`
  | `data${string}`
  | `on${string}`
  | `__${string}`;
type PrimitiveProp = string | number | boolean | null | undefined;
type IsAny<T> = 0 extends 1 & T ? true : false;

/** Primitive library drawing props only; caller-owned semantics are excluded. */
export type IconAdapterProps<P> = {
  [
    K in keyof P as K extends string
      ? Lowercase<K> extends DeniedPropName
        ? never
        : IsAny<P[K]> extends true
          ? never
          : [P[K]] extends [PrimitiveProp]
            ? K
            : never
      : never
  ]: P[K];
};
/** Only this adapter's declared axes enter the mapper, never application-wide unions. */
export interface IconAdapterRequest<C extends IconCapabilities> {
  readonly size?: IconContractSize<C> &
    (keyof NonNullable<C['sizes']> & string);
  readonly appearance?: IconContractAppearance<C>;
  readonly weight?: IconContractWeight<C>;
}
type DefaultPropNames = readonly ['appearance', 'weight'];
type MappedKeys<M> = M extends unknown ? keyof M : never;
type InvalidMappedKeys<M, K extends ReadonlyArray<string>> = M extends unknown
  ? Exclude<keyof M, keyof IconAdapterProps<M> & K[number]>
  : never;
interface IconAdapterInput<
  C extends IconCapabilities,
  MapperProps extends object,
  PropNames extends ReadonlyArray<string>,
> {
  readonly capabilities: C;
  readonly propNames?: PropNames;
  readonly resolveProps: (
    request: IconAdapterRequest<NoInfer<C>>,
  ) => MapperProps;
}
type ValidAdapterMapping<M, K extends ReadonlyArray<string>> = {
  readonly propNames?: ReadonlyArray<keyof IconAdapterProps<M> & string>;
} & Record<InvalidMappedKeys<M, K>, never>;
/** Optional propNames defaults to the draft's library appearance/weight mapping. */
export type IconAdapterOptions<
  C extends IconCapabilities,
  MapperProps extends object,
  PropNames extends ReadonlyArray<string> = DefaultPropNames,
> = IconAdapterInput<C, MapperProps, PropNames> &
  ValidAdapterMapping<MapperProps, PropNames>;
// Validation lives in the mapper parameter's own constraint, which is resolved
// only after the deferred mapper body is inferred. Naming MapperProps in the
// options parameter instead (a conditional, a Record, a rest tuple or a this
// type) resolves it to `object` before that inference runs, which drops the
// declared axes from a plain `resolveProps(request)` mapper.
type ValidMapperProps<M, K extends ReadonlyArray<string>> = [
  Extract<M, (...args: never[]) => unknown>,
] extends [never]
  ? [InvalidMappedKeys<M, K>] extends [never]
    ? [
        Exclude<
          K[number],
          MappedKeys<IconAdapterProps<M>> | DefaultPropNames[number]
        >,
      ] extends [never]
      ? object
      : {readonly __invalidIconAdapterPropNames: never}
    : {readonly __invalidIconAdapterMapping: never}
  : {readonly __invalidIconAdapterMapping: never};
type CompatibleComponent<P, M> =
  SVGProps<SVGSVGElement> extends P
    ? Exclude<MappedKeys<M>, keyof IconAdapterProps<P>> extends never
      ? [M] extends [Partial<IconAdapterProps<P>>]
        ? unknown
        : never
      : never
    : never;

interface IconAdapterMetadata {
  readonly capabilities: IconCapabilities;
  readonly propNames: ReadonlyArray<string>;
  readonly resolveProps: (
    request: IconAdapterRequest<IconCapabilities>,
  ) => unknown;
}
const adapters = new WeakMap<object, IconAdapterMetadata>();
const deniedPropNames = new Set(
  reservedPropNames.map(name => name.toLowerCase()),
);
const defaultPropNames: DefaultPropNames = Object.freeze([
  'appearance',
  'weight',
]);
function isAllowedPropName(name: string): boolean {
  const lower = name.toLowerCase();
  return (
    name.length > 0 &&
    name.trim() === name &&
    !deniedPropNames.has(lower) &&
    !/^(?:aria|data|on|__)/.test(lower)
  );
}

/** Bind a pure local mapper, then adapt a supplied library component once. */
export function createIconAdapter<
  const C extends IconCapabilities,
  const MapperProps extends ValidMapperProps<MapperProps, PropNames>,
  const PropNames extends ReadonlyArray<string> = DefaultPropNames,
>(
  options: IconAdapterInput<C, MapperProps & object, PropNames>,
): <P extends object>(
  Component: ComponentType<P> &
    CompatibleComponent<NoInfer<P>, MapperProps & object>,
) => IconType;
export function createIconAdapter(
  options: IconAdapterInput<IconCapabilities, object, ReadonlyArray<string>>,
): <P extends object>(Component: ComponentType<P>) => IconType {
  requireRecord(options, 'adapter options');
  for (const name of Reflect.ownKeys(options)) {
    if (
      typeof name !== 'string' ||
      !['capabilities', 'resolveProps', 'propNames'].includes(name)
    ) {
      throw new Error('Icon: unknown adapter option.');
    }
    getOwnIconData(options, name);
  }
  const capabilities = defineIconCapabilities(
    getOwnIconData(options, 'capabilities') as IconCapabilities,
  );
  const resolveProps = getOwnIconData(options, 'resolveProps');
  if (typeof resolveProps !== 'function') {
    throw new Error('Icon: adapter resolveProps must be a function.');
  }
  const configuredNames = getOwnIconData(options, 'propNames');
  const names =
    configuredNames === undefined ? defaultPropNames : configuredNames;
  requireIconDataArray(names, 'adapter propNames');
  const selectedNames: string[] = [];
  for (const name of names) {
    if (
      typeof name !== 'string' ||
      !isAllowedPropName(name) ||
      selectedNames.includes(name)
    ) {
      throw new Error(
        'Icon: adapter propNames must be unique library drawing props.',
      );
    }
    selectedNames.push(name);
  }
  const mapper = resolveProps as (
    request: IconAdapterRequest<IconCapabilities>,
  ) => unknown;
  const metadata: IconAdapterMetadata = Object.freeze({
    capabilities,
    propNames: Object.freeze(selectedNames),
    // selectIconAdapter has already checked every axis against this exact C.
    // eslint-disable-next-line @typescript-eslint/promise-function-async -- Opaque mapper values stay synchronous; promises are rejected, never awaited.
    resolveProps: (request: IconAdapterRequest<IconCapabilities>) =>
      mapper(request),
  });
  const wrappers = new WeakMap<object, IconType>();
  return function adaptIcon<P extends object>(
    Component: ComponentType<P>,
  ): IconType {
    if (!isIconComponent(Component)) {
      throw new Error('Icon: an adapter must wrap a supplied icon component.');
    }
    const previous = wrappers.get(Component);
    if (previous) {
      return previous;
    }
    // No dispatch here: direct wrapper use always preserves the supplied default.
    // React's ref prop travels unchanged with the caller's SVG props.
    function AdaptedIcon(props: SVGProps<SVGSVGElement>) {
      return React.createElement(Component, props as P);
    }
    AdaptedIcon.displayName = 'AdaptedIcon';
    adapters.set(AdaptedIcon, metadata);
    wrappers.set(Component, AdaptedIcon);
    return AdaptedIcon;
  };
}

/** @internal Recognition is identity-only; never inspect foreign component metadata. */
export function getIconAdapter(icon: unknown): IconAdapterMetadata | undefined {
  return (typeof icon === 'object' && icon !== null) ||
    typeof icon === 'function'
    ? adapters.get(icon)
    : undefined;
}
export interface IconAdapterSelection {
  readonly sizeSupported: boolean;
  readonly appearanceSupported: boolean;
  readonly weightSupported: boolean;
  readonly mappedProps?: Readonly<Record<string, PrimitiveProp>>;
  readonly malformed: boolean;
}
/** @internal Narrow locally before mapping; implicit transport size is not intent. */
export function selectIconAdapter(
  adapter: IconAdapterMetadata,
  request: {size: string; appearance?: string; weight?: string | number},
  explicitSizeAdmitted: boolean,
): IconAdapterSelection {
  const {capabilities} = adapter;
  const sizeSupported =
    capabilities.sizes !== undefined &&
    Object.hasOwn(capabilities.sizes, request.size);
  const appearanceSupported =
    request.appearance !== undefined &&
    capabilities.appearances?.includes(request.appearance) === true;
  const weightSupported =
    request.weight !== undefined &&
    admitsIconWeight(capabilities, request.weight);
  const support = {sizeSupported, appearanceSupported, weightSupported};
  if (
    !(explicitSizeAdmitted && sizeSupported) &&
    !appearanceSupported &&
    !weightSupported
  ) {
    return {...support, malformed: false};
  }
  const narrowed = Object.freeze({
    ...(sizeSupported ? {size: request.size} : {}),
    ...(appearanceSupported ? {appearance: request.appearance} : {}),
    ...(weightSupported ? {weight: request.weight} : {}),
  });
  try {
    const output = adapter.resolveProps(narrowed);
    requireRecord(output, 'adapter mapped props');
    const mappedProps: Record<string, PrimitiveProp> = {};
    for (const name of Reflect.ownKeys(output)) {
      if (
        typeof name !== 'string' ||
        !isAllowedPropName(name) ||
        !adapter.propNames.includes(name)
      ) {
        throw new Error(
          'Icon: an adapter returned an unknown or caller-owned prop.',
        );
      }
      const value = getOwnIconData(output, name);
      if (
        value !== undefined &&
        value !== null &&
        typeof value !== 'string' &&
        typeof value !== 'boolean' &&
        !(typeof value === 'number' && Number.isFinite(value))
      ) {
        throw new Error(
          'Icon: adapter mapped props must be finite primitive data.',
        );
      }
      mappedProps[name] = value;
    }
    return {
      ...support,
      mappedProps: Object.freeze(mappedProps),
      malformed: false,
    };
  } catch {
    return {...support, malformed: true};
  }
}
