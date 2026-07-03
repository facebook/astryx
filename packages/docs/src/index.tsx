import type { ReactNode } from 'react';
import { Box, Flex, Surface } from '@jedi/foundation';
import { Badge, Heading, Text } from '@jedi/react';
import { colors, spacing, radii } from '@jedi/stylex';
import { getAllCssVars } from '@jedi/tokens';

export interface EvidencePanelProps {
  claim: string;
  source: string;
  confidence: 'high' | 'medium' | 'low';
  children?: ReactNode;
}

const confidenceVariant = {
  high: 'success' as const,
  medium: 'warning' as const,
  low: 'default' as const,
};

export function EvidencePanel({ claim, source, confidence, children }: EvidencePanelProps) {
  return (
    <Surface border padding={4} style={{ borderLeft: `4px solid var(--jedi-color-blue-600)` }}>
      <Flex direction="column" gap={2}>
        <Flex align="center" gap={2}>
          <Text variant="caption">Evidence</Text>
          <Badge variant={confidenceVariant[confidence]}>{confidence} confidence</Badge>
        </Flex>
        <Text variant="heading" as="p" style={{ fontSize: 'var(--jedi-font-size-400)' }}>{claim}</Text>
        <Text variant="secondary">Source: {source}</Text>
        {children}
      </Flex>
    </Surface>
  );
}

export interface ADRViewerProps {
  id: string;
  title: string;
  status: string;
  decision: string;
  date?: string;
}

export function ADRViewer({ id, title, status, decision, date }: ADRViewerProps) {
  return (
    <Surface border padding={4}>
      <Flex direction="column" gap={2}>
        <Flex align="center" gap={2}>
          <Badge>{id}</Badge>
          <Badge variant="default">{status}</Badge>
          {date && <Text variant="caption">{date}</Text>}
        </Flex>
        <Heading level={3}>{title}</Heading>
        <Text>{decision}</Text>
      </Flex>
    </Surface>
  );
}

export interface MetricsCardProps {
  label: string;
  value: string | number;
  delta?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export function MetricsCard({ label, value, delta, trend = 'neutral' }: MetricsCardProps) {
  const trendColor = {
    up: 'var(--jedi-semantic-status-success)',
    down: 'var(--jedi-semantic-status-error)',
    neutral: colors.textSecondary,
  };
  return (
    <Surface elevation="sm" border padding={4}>
      <Text variant="secondary">{label}</Text>
      <Text variant="heading" as="p" style={{ fontSize: 'var(--jedi-font-size-700)', margin: `${spacing[2]} 0` }}>
        {value}
      </Text>
      {delta && (
        <Text variant="caption" style={{ color: trendColor[trend] }}>{delta}</Text>
      )}
    </Surface>
  );
}

export interface ResearchCalloutProps {
  title: string;
  children: ReactNode;
  variant?: 'info' | 'insight' | 'caution';
}

export function ResearchCallout({ title, children, variant = 'info' }: ResearchCalloutProps) {
  const borderColors = {
    info: 'var(--jedi-color-blue-500)',
    insight: 'var(--jedi-semantic-status-success)',
    caution: 'var(--jedi-semantic-status-warning)',
  };
  return (
    <Box
      padding={4}
      style={{
        borderLeft: `4px solid ${borderColors[variant]}`,
        backgroundColor: colors.surfaceSecondary,
        borderRadius: radii.md,
      }}
    >
      <Heading level={3} style={{ marginBottom: spacing[2] }}>{title}</Heading>
      <Text>{children}</Text>
    </Box>
  );
}

export interface TokenViewerProps {
  mode?: 'light' | 'dark';
}

export function TokenViewer({ mode = 'light' }: TokenViewerProps) {
  const vars = getAllCssVars(mode);
  const entries = Object.entries(vars).slice(0, 12);
  return (
    <Surface border padding={4}>
      <Heading level={3} style={{ marginBottom: spacing[4] }}>Token Viewer ({mode})</Heading>
      <Flex direction="column" gap={1}>
        {entries.map(([key, value]) => (
          <Flex key={key} gap={2} style={{ fontFamily: 'var(--jedi-font-family-mono)', fontSize: '12px' }}>
            <Text as="span" variant="caption" style={{ minWidth: 240 }}>{key}</Text>
            <Text as="span" variant="body">{value}</Text>
          </Flex>
        ))}
      </Flex>
    </Surface>
  );
}

export interface ArtifactGalleryProps {
  items: Array<{ id: string; title: string; description?: string }>;
}

export function ArtifactGallery({ items }: ArtifactGalleryProps) {
  return (
    <Flex wrap gap={4}>
      {items.map((item) => (
        <Surface key={item.id} border padding={4} style={{ width: 200 }}>
          <Text variant="heading" as="p">{item.title}</Text>
          {item.description && <Text variant="secondary">{item.description}</Text>}
        </Surface>
      ))}
    </Flex>
  );
}

