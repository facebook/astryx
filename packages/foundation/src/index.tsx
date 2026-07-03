import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { colors, spacing, radii } from '@jedi/stylex';

export type SpacingKey = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16;

const spacingMap: Record<SpacingKey, string> = {
  0: spacing[0],
  1: spacing[1],
  2: spacing[2],
  3: spacing[3],
  4: spacing[4],
  5: 'var(--jedi-spacing-5)',
  6: spacing[6],
  8: spacing[8],
  10: 'var(--jedi-spacing-10)',
  12: 'var(--jedi-spacing-12)',
  16: 'var(--jedi-spacing-16)',
};

export function resolveSpacing(value?: SpacingKey): string | undefined {
  return value !== undefined ? spacingMap[value] : undefined;
}

export interface BoxProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  padding?: SpacingKey;
  margin?: SpacingKey;
  background?: 'primary' | 'secondary' | 'tertiary';
  radius?: 'sm' | 'md' | 'lg';
}

export function Box({
  children,
  padding,
  margin,
  background = 'primary',
  radius,
  style,
  ...props
}: BoxProps) {
  const bgMap = {
    primary: colors.surfacePrimary,
    secondary: colors.surfaceSecondary,
    tertiary: 'var(--jedi-semantic-surface-tertiary)',
  };
  const styles: CSSProperties = {
    padding: resolveSpacing(padding),
    margin: resolveSpacing(margin),
    backgroundColor: bgMap[background],
    borderRadius: radius ? radii[radius] : undefined,
    ...style,
  };
  return (
    <div style={styles} {...props}>
      {children}
    </div>
  );
}

export interface FlexProps extends BoxProps {
  direction?: 'row' | 'column';
  align?: CSSProperties['alignItems'];
  justify?: CSSProperties['justifyContent'];
  gap?: SpacingKey;
  wrap?: boolean;
}

export function Flex({
  direction = 'row',
  align,
  justify,
  gap,
  wrap,
  style,
  children,
  ...props
}: FlexProps) {
  const styles: CSSProperties = {
    display: 'flex',
    flexDirection: direction,
    alignItems: align,
    justifyContent: justify,
    gap: resolveSpacing(gap),
    flexWrap: wrap ? 'wrap' : undefined,
    ...style,
  };
  return (
    <Box style={styles} {...props}>
      {children}
    </Box>
  );
}

export interface StackProps extends Omit<FlexProps, 'direction'> {
  spacing?: SpacingKey;
}

export function Stack({ spacing: gap = 4, ...props }: StackProps) {
  return <Flex direction="column" gap={gap} {...props} />;
}

export interface GridProps extends BoxProps {
  columns?: number | string;
  gap?: SpacingKey;
}

export function Grid({ columns = 1, gap = 4, style, children, ...props }: GridProps) {
  const styles: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: typeof columns === 'number' ? `repeat(${columns}, 1fr)` : columns,
    gap: resolveSpacing(gap),
    ...style,
  };
  return (
    <Box style={styles} {...props}>
      {children}
    </Box>
  );
}

export interface SurfaceProps extends BoxProps {
  elevation?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
}

export function Surface({
  elevation = 'none',
  border = false,
  style,
  children,
  ...props
}: SurfaceProps) {
  const shadowMap = {
    none: undefined,
    sm: 'var(--jedi-elevation-shadow-sm)',
    md: 'var(--jedi-elevation-shadow-md)',
    lg: 'var(--jedi-elevation-shadow-lg)',
  };
  const styles: CSSProperties = {
    boxShadow: shadowMap[elevation],
    border: border ? `1px solid ${colors.borderSubtle}` : undefined,
    ...style,
  };
  return (
    <Box background="secondary" radius="md" style={styles} {...props}>
      {children}
    </Box>
  );
}

export { Box as Inline };
export { Box as Block };
