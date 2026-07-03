import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';
import { Box, Flex, Surface, type SpacingKey } from '@jedi/foundation';
import { colors, typography, radii, spacing } from '@jedi/stylex';
import { IconX } from '@jedi/icons';

export interface TextProps {
  children: ReactNode;
  as?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'label';
  variant?: 'body' | 'secondary' | 'caption' | 'heading';
  className?: string;
  id?: string;
  style?: React.CSSProperties;
}

const textStyles = {
  body: { fontSize: typography.size300, color: colors.textPrimary },
  secondary: { fontSize: typography.size200, color: colors.textSecondary },
  caption: { fontSize: 'var(--jedi-font-size-100)', color: colors.textSecondary },
  heading: {
    fontSize: typography.size300,
    fontWeight: typography.weightMedium,
    color: colors.textPrimary,
    margin: 0,
  },
};

export function Text({ children, as: Tag = 'p', variant = 'body', style, className, id }: TextProps) {
  return (
    <Tag className={className} id={id} style={{ ...textStyles[variant], ...style }}>
      {children}
    </Tag>
  );
}

export function Heading({
  children,
  level = 2,
  style,
  className,
  id,
}: TextProps & { level?: 1 | 2 | 3; id?: string }) {
  const tag = (`h${level}` as 'h1' | 'h2' | 'h3');
  return (
    <Text
      as={tag}
      variant="heading"
      id={id}
      className={className}
      style={{ fontSize: `var(--jedi-font-size-${level === 1 ? 700 : level === 2 ? 600 : 500})`, ...style }}
    >
      {children}
    </Text>
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  variant = 'primary',
  size = 'md',
  disabled,
  style,
  children,
  ...props
}: ButtonProps) {
  const sizeStyles = {
    sm: { padding: `${spacing[1]} ${spacing[3]}`, fontSize: typography.size200 },
    md: { padding: `${spacing[2]} ${spacing[4]}`, fontSize: typography.size200 },
    lg: { padding: `${spacing[3]} ${spacing[6]}`, fontSize: typography.size300 },
  };
  const variantStyles = {
    primary: {
      backgroundColor: 'var(--jedi-color-blue-600)',
      color: '#ffffff',
      border: 'none',
    },
    secondary: {
      backgroundColor: colors.surfaceSecondary,
      color: colors.textPrimary,
      border: `1px solid ${colors.borderSubtle}`,
    },
    ghost: {
      backgroundColor: 'transparent',
      color: colors.textPrimary,
      border: 'none',
    },
  };
  return (
    <button
      type="button"
      disabled={disabled}
      style={{
        borderRadius: radii.md,
        fontFamily: typography.fontSans,
        fontWeight: typography.weightMedium,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        ...sizeStyles[size],
        ...variantStyles[variant],
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}

export interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

export function Badge({ children, variant = 'default' }: BadgeProps) {
  const variants = {
    default: { bg: colors.surfaceSecondary, color: colors.textPrimary },
    success: { bg: 'var(--jedi-semantic-status-success)', color: '#fff' },
    warning: { bg: 'var(--jedi-semantic-status-warning)', color: '#000' },
    error: { bg: 'var(--jedi-semantic-status-error)', color: '#fff' },
  };
  const v = variants[variant];
  return (
    <span
      style={{
        display: 'inline-flex',
        padding: `${spacing[0]} ${spacing[2]}`,
        borderRadius: radii.sm,
        fontSize: typography.size200,
        fontWeight: typography.weightMedium,
        backgroundColor: v.bg,
        color: v.color,
      }}
    >
      {children}
    </span>
  );
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, style, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <Flex direction="column" gap={1}>
      {label && (
        <label htmlFor={inputId} style={{ fontSize: typography.size200, color: colors.textSecondary }}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        style={{
          padding: `${spacing[2]} ${spacing[3]}`,
          borderRadius: radii.md,
          border: `1px solid ${colors.borderSubtle}`,
          backgroundColor: colors.surfacePrimary,
          color: colors.textPrimary,
          fontSize: typography.size200,
          fontFamily: typography.fontSans,
          ...style,
        }}
        {...props}
      />
    </Flex>
  );
}

export interface CheckboxProps {
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}

export function Checkbox({ label, checked, onChange, disabled }: CheckboxProps) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: spacing[2], cursor: disabled ? 'not-allowed' : 'pointer' }}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        style={{ accentColor: 'var(--jedi-color-blue-600)' }}
      />
      <Text as="span" variant="body">{label}</Text>
    </label>
  );
}

export interface CardProps {
  children: ReactNode;
  title?: string;
  padding?: SpacingKey;
}

export function Card({ children, title, padding = 6 }: CardProps) {
  return (
    <Surface elevation="md" border padding={padding}>
      {title && <Heading level={3} style={{ marginBottom: spacing[4] }}>{title}</Heading>}
      {children}
    </Surface>
  );
}

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Dialog({ open, onClose, title, children }: DialogProps) {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="jedi-dialog-title"
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgb(0 0 0 / 0.5)',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <Surface
        elevation="lg"
        padding={6}
        style={{ minWidth: 320, maxWidth: 480 }}
        onClick={(e) => e.stopPropagation()}
      >
        <Flex justify="space-between" align="center" style={{ marginBottom: spacing[4] }}>
          <Heading level={3} id="jedi-dialog-title">{title}</Heading>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">
            <IconX size={18} />
          </Button>
        </Flex>
        {children}
      </Surface>
    </div>
  );
}

export interface ToolbarProps {
  children: ReactNode;
}

export function Toolbar({ children }: ToolbarProps) {
  return (
    <Flex
      align="center"
      gap={2}
      padding={2}
      style={{
        borderBottom: `1px solid ${colors.borderSubtle}`,
        backgroundColor: colors.surfaceSecondary,
      }}
    >
      {children}
    </Flex>
  );
}

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Search...' }: SearchBarProps) {
  return (
    <Input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
    />
  );
}

export interface FormFieldProps {
  label: string;
  children: ReactNode;
  hint?: string;
}

export function FormField({ label, children, hint }: FormFieldProps) {
  return (
    <Flex direction="column" gap={1}>
      <Text as="label" variant="secondary">{label}</Text>
      {children}
      {hint && <Text variant="caption">{hint}</Text>}
    </Flex>
  );
}

export function Spinner({ size = 24 }: { size?: number }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      style={{
        width: size,
        height: size,
        border: `2px solid ${colors.borderSubtle}`,
        borderTopColor: 'var(--jedi-color-blue-600)',
        borderRadius: '50%',
        animation: 'jedi-spin 0.8s linear infinite',
      }}
    />
  );
}

export { IconCheck, IconSearch, IconX, IconInfo } from '@jedi/icons';
