import type { ReactNode } from 'react';
import { Box, Flex, Grid, Stack } from '@jedi/foundation';
import { Heading, SearchBar, Text, Toolbar } from '@jedi/react';
import { colors, spacing } from '@jedi/stylex';

export interface DocLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
  title?: string;
}

export function DocLayout({ sidebar, children, title }: DocLayoutProps) {
  return (
    <Grid columns="240px 1fr" style={{ minHeight: '100vh' }}>
      <Box
        padding={4}
        style={{
          borderRight: `1px solid ${colors.borderSubtle}`,
          backgroundColor: colors.surfaceSecondary,
        }}
      >
        {sidebar}
      </Box>
      <Stack spacing={0}>
        {title && (
          <Toolbar>
            <Heading level={2}>{title}</Heading>
          </Toolbar>
        )}
        <Box padding={6}>{children}</Box>
      </Stack>
    </Grid>
  );
}

export interface NavItem {
  id: string;
  label: string;
  href?: string;
  active?: boolean;
}

export interface SideNavProps {
  items: NavItem[];
  onSelect?: (id: string) => void;
}

export function SideNav({ items, onSelect }: SideNavProps) {
  return (
    <Stack spacing={1}>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect?.(item.id)}
          style={{
            textAlign: 'left',
            padding: `${spacing[2]} ${spacing[3]}`,
            border: 'none',
            borderRadius: 'var(--jedi-radius-md)',
            background: item.active ? colors.surfacePrimary : 'transparent',
            color: colors.textPrimary,
            cursor: 'pointer',
            fontWeight: item.active ? 600 : 400,
          }}
        >
          {item.label}
        </button>
      ))}
    </Stack>
  );
}

export interface CommandPaletteProps {
  open: boolean;
  query: string;
  onQueryChange: (q: string) => void;
  items: Array<{ id: string; label: string; onSelect: () => void }>;
  onClose: () => void;
}

export function CommandPalette({ open, query, onQueryChange, items, onClose }: CommandPaletteProps) {
  if (!open) return null;
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgb(0 0 0 / 0.4)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: 120,
        zIndex: 2000,
      }}
      onClick={onClose}
    >
      <Box
        padding={4}
        style={{
          width: 480,
          backgroundColor: colors.surfacePrimary,
          borderRadius: 'var(--jedi-radius-lg)',
          boxShadow: 'var(--jedi-elevation-shadow-lg)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <SearchBar value={query} onChange={onQueryChange} placeholder="Type a command..." />
        <Stack spacing={1} style={{ marginTop: spacing[4] }}>
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => { item.onSelect(); onClose(); }}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: spacing[2],
                border: 'none',
                borderRadius: 'var(--jedi-radius-sm)',
                background: 'transparent',
                color: colors.textPrimary,
                cursor: 'pointer',
              }}
            >
              {item.label}
            </button>
          ))}
        </Stack>
      </Box>
    </div>
  );
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <Flex justify="space-between" align="flex-start" style={{ marginBottom: spacing[6] }}>
      <Stack spacing={1}>
        <Heading level={1}>{title}</Heading>
        {description && <Text variant="secondary">{description}</Text>}
      </Stack>
      {actions}
    </Flex>
  );
}
