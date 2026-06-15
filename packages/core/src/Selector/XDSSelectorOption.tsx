// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file XDSSelectorOption.tsx
 * @output Exports XDSSelectorOption component for custom option rendering
 * @position Sub-component; used by XDSSelector and consumers for custom options
 *
 * Composes XDSItem for the shared start content + label + description + end content layout.
 */

import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {renderIconSlot, type XDSIconType} from '../Icon';
import {XDSItem} from '../Item';
import {mergeProps} from '../utils';
import {xdsThemeProps} from '../utils/xdsThemeProps';

const embeddedStyles = stylex.create({
  root: {
    paddingBlock: 0,
    paddingInline: 0,
    borderRadius: 0,
  },
});

export interface XDSSelectorOptionProps {
  /**
   * Icon to display before the label.
   */
  icon?: ReactNode | XDSIconType;

  /**
   * Primary label text.
   */
  label: ReactNode;

  /**
   * Secondary description text displayed below the label.
   */
  description?: ReactNode;

  /**
   * Additional content to render after the label/description.
   */
  endContent?: ReactNode;

  /**
   * StyleX styles created via `stylex.create()`. Merged with the component's
   * base styles inside a single `stylex.props()` call for optimal deduplication.
   *
   * @example
   * ```
   * const overrides = stylex.create({ root: { marginBottom: 8 } });
   * <Component xstyle={overrides.root} />
   * ```
   */
  xstyle?: StyleXStyles;
  /**
   * CSS class name(s) appended to the root element.
   * If you're using StyleX, prefer `xstyle` for optimal style deduplication.
   */
  className?: string;
  /**
   * Inline styles to apply to the root element. Spread after StyleX
   * inline styles, so these values take priority.
   */
  style?: React.CSSProperties;
}

/**
 * A helper component for rendering custom selector options with consistent styling.
 *
 * Use this inside the `children` render prop of XDSSelector to create
 * custom option layouts while maintaining design system consistency.
 *
 * @example
 * ```
 * <XDSSelector
 *   label="User"
 *   options={users}
 *   value={value}
 *   onChange={setValue}>
 *   {option => (
 *     <XDSSelectorOption
 *       icon={UserIcon}
 *       label={option.label}
 *       description={option.email}
 *     />
 *   )}
 * </XDSSelector>
 * ```
 */
export function XDSSelectorOption({
  icon,
  label,
  description,
  endContent,
  xstyle,
  className,
  style,
}: XDSSelectorOptionProps) {
  return (
    <XDSItem
      startContent={
        icon
          ? renderIconSlot(icon, {size: 'sm', color: 'secondary'})
          : undefined
      }
      label={label}
      description={description}
      endContent={endContent}
      xstyle={[embeddedStyles.root, xstyle]}
      {...mergeProps(xdsThemeProps('selector-option'), {className, style})}
    />
  );
}

XDSSelectorOption.displayName = 'XDSSelectorOption';
