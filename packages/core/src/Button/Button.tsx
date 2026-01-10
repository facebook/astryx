/**
 * @file Button.tsx
 * @input Uses React forwardRef, ButtonHTMLAttributes, ReactNode
 * @output Exports Button component, ButtonProps, ButtonVariant, ButtonSize types
 * @position Core implementation; consumed by index.ts, tested by Button.test.tsx
 *
 * SYNC: When modified, update this header and /packages/core/src/Button/README.md
 */

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * The visual style variant of the button.
   * @default 'primary'
   */
  variant?: ButtonVariant;
  /**
   * The size of the button.
   * @default 'md'
   */
  size?: ButtonSize;
  /**
   * Whether the button is in a loading state.
   * @default false
   */
  loading?: boolean;
  /**
   * Content to render inside the button.
   */
  children: ReactNode;
}

/**
 * A versatile button component with multiple variants and sizes.
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md">Click me</Button>
 * <Button variant="secondary" loading>Saving...</Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      children,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        data-variant={variant}
        data-size={size}
        data-loading={loading || undefined}
        className={className}
        {...props}
      >
        {loading ? 'Loading...' : children}
      </button>
    );
  }
);

Button.displayName = 'Button';
