/**
 * @file XDSSelectorOption.tsx
 * @output Exports XDSSelectorOption component for custom option rendering
 * @position Sub-component; used by XDSSelector and consumers for custom options
 */

import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {XDSIcon} from '../Icon';
import type {XDSIconType} from '../Icon';
import {XDSText} from '../Text';
import {spacingVars} from '../theme/tokens.stylex';
import {xdsClassName, mergeProps} from '../utils';

const styles = stylex.create({
  root: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    flex: 1,
    minWidth: 0,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minWidth: 0,
  },
});

export interface XDSSelectorOptionProps {
  /**
   * Icon to display before the label.
   */
  icon?: XDSIconType;

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
  children?: ReactNode;

  /**
   * StyleX styles created via `stylex.create()`. Merged with the component's
   * base styles inside a single `stylex.props()` call for optimal deduplication.
   *
   * @example
   * ```tsx
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
  children,
  xstyle,
  className,
  style,
}: XDSSelectorOptionProps) {
  return (
    <span
      {...mergeProps(
        xdsClassName('selector-option'),
        stylex.props(styles.root, xstyle),
        className,
        style,
      )}>
      {icon && <XDSIcon icon={icon} size="sm" color="secondary" />}
      <span {...stylex.props(styles.content)}>
        {typeof label === 'string' ? (
          <XDSText type="body" maxLines={1}>
            {label}
          </XDSText>
        ) : (
          label
        )}
        {description && (
          <XDSText type="supporting" maxLines={1}>
            {description}
          </XDSText>
        )}
      </span>
      {children}
    </span>
  );
}

XDSSelectorOption.displayName = 'XDSSelectorOption';

/**
 * @deprecated Use XDSSelectorOption instead (renamed from XDSSelectorItem)
 */
export const XDSSelectorItem = XDSSelectorOption;
