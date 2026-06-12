// Copyright (c) Meta Platforms, Inc. and affiliates.

import {isXDSPropsObject, type XDSDataAttributes} from './xdsClassName';

/**
 * Merge xds-* props, stylex.props result, and optional consumer className/style.
 *
 * stylex.props() returns { className, style }. This merges the xds-*
 * class name into the className string so both StyleX styles and the
 * stable theme-targeting class are applied. When passed `xdsProps()`, it also
 * preserves data-* attributes that reflect visual props for safer selectors.
 *
 * Consumer className is appended after StyleX classes.
 * Consumer style is spread after StyleX inline styles, so these values take priority.
 *
 * @example
 * ```tsx
 * // Root element with xdsProps
 * <div {...mergeProps(
 *   xdsProps('button', { variant }),
 *   stylex.props(styles.base, variants[variant]),
 *   className,
 *   style,
 * )} />
 *
 * // Internal element — stylex + dynamic style only
 * <div {...mergeProps(
 *   stylex.props(styles.track),
 *   { style: { width: dynamicWidth } },
 * )} />
 * ```
 */

type StyleObject = React.CSSProperties;

type StyleXResult = {className?: string; style?: StyleObject};

type DataProps = XDSDataAttributes;

interface MergedProps extends DataProps {
  className: string;
  style?: StyleObject;
}

function mergeClassNames(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

function mergeStyle(
  baseStyle?: StyleObject,
  overrideStyle?: StyleObject,
): StyleObject | undefined {
  return baseStyle && overrideStyle
    ? {...baseStyle, ...overrideStyle}
    : overrideStyle || baseStyle;
}

function getDataProps(props: object): DataProps {
  const dataProps: DataProps = {};
  for (const [key, value] of Object.entries(props)) {
    if (key.startsWith('data-')) {
      dataProps[key as `data-${string}`] = value as string | undefined;
    }
  }
  return dataProps;
}

export function mergeProps(
  xdsClassOrStylexResult: string | StyleXResult,
  stylexResultOrClassName?: StyleXResult | string,
  classNameOrStyle?: string | React.CSSProperties,
  style?: React.CSSProperties,
): MergedProps {
  // xdsProps form: mergeProps(xdsProps(...), stylex.props(...), className?, style?)
  if (isXDSPropsObject(xdsClassOrStylexResult)) {
    const xdsBase = xdsClassOrStylexResult;
    const stylexResult =
      typeof stylexResultOrClassName === 'object' &&
      stylexResultOrClassName != null
        ? stylexResultOrClassName
        : {};
    const positionalClassName =
      typeof stylexResultOrClassName === 'string'
        ? stylexResultOrClassName
        : undefined;
    const className =
      positionalClassName ?? (classNameOrStyle as string | undefined);
    const overrideStyle =
      positionalClassName != null ? (classNameOrStyle as StyleObject) : style;
    const dataProps = getDataProps(xdsBase);

    return {
      ...dataProps,
      className: mergeClassNames(
        xdsBase.className,
        stylexResult.className,
        className,
      ),
      style: mergeStyle(stylexResult.style, overrideStyle),
    };
  }

  // Legacy string form: mergeProps(xdsClassName(...), stylex.props(...), className?, style?)
  if (typeof xdsClassOrStylexResult === 'string') {
    const xdsClass = xdsClassOrStylexResult;
    const stylexResult =
      typeof stylexResultOrClassName === 'object' &&
      stylexResultOrClassName != null
        ? stylexResultOrClassName
        : {};
    const className = classNameOrStyle as string | undefined;

    return {
      className: mergeClassNames(xdsClass, stylexResult.className, className),
      style: mergeStyle(stylexResult.style, style),
    };
  }

  // Object form: mergeProps(stylex.props(...), { style, className })
  // or mergeProps(stylex.props(...), className, style)
  const base = xdsClassOrStylexResult;
  const positionalClassName =
    typeof stylexResultOrClassName === 'string'
      ? stylexResultOrClassName
      : undefined;
  const positionalStyle =
    typeof stylexResultOrClassName === 'string'
      ? (classNameOrStyle as React.CSSProperties | undefined)
      : undefined;
  const overrides =
    typeof stylexResultOrClassName === 'object' &&
    stylexResultOrClassName != null
      ? stylexResultOrClassName
      : {};

  return {
    ...getDataProps(base),
    ...getDataProps(overrides),
    className: mergeClassNames(
      base.className,
      overrides.className,
      positionalClassName,
    ),
    style: mergeStyle(base.style, positionalStyle ?? overrides.style),
  };
}
