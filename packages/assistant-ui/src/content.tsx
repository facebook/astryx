// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file content.tsx
 * @input Uses assistant-ui message part contracts and Astryx content primitives
 * @output Exports message text, reasoning, timing, context, media, quote, source, and directive adapters
 * @position Ready content renderer layer for @astryxdesign/assistant-ui
 */

import {memo, type ComponentProps, type FC, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  type FileMessagePartComponent,
  type ImageMessagePartComponent,
  type QuoteMessagePartComponent,
  type ReasoningGroupComponent,
  type ReasoningMessagePartComponent,
  type SourceMessagePartComponent,
  type TextMessagePartComponent,
  type Unstable_DirectiveFormatter,
  unstable_defaultDirectiveFormatter,
  useMessageTiming,
} from '@assistant-ui/react';
import {Badge} from '@astryxdesign/core/Badge';
import {Blockquote} from '@astryxdesign/core/Blockquote';
import {Collapsible} from '@astryxdesign/core/Collapsible';
import {HStack} from '@astryxdesign/core/HStack';
import {Icon} from '@astryxdesign/core/Icon';
import {Item} from '@astryxdesign/core/Item';
import {Link} from '@astryxdesign/core/Link';
import {Markdown} from '@astryxdesign/core/Markdown';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {Text} from '@astryxdesign/core/Text';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {VStack} from '@astryxdesign/core/VStack';
import {radiusVars} from '@astryxdesign/core/theme/tokens.stylex';

const styles = stylex.create({
  image: {
    display: 'block',
    width: '100%',
    height: 'auto',
    maxWidth: 512,
    maxHeight: '70vh',
    objectFit: 'contain',
    borderRadius: radiusVars['--radius-container'],
  },
  sourceIcon: {
    width: 16,
    height: 16,
    borderRadius: radiusVars['--radius-element'],
  },
  directiveText: {
    whiteSpace: 'pre-wrap',
  },
  timing: {
    fontVariantNumeric: 'tabular-nums',
  },
  contextPanel: {
    minWidth: 220,
  },
  fileRow: {
    minWidth: 240,
  },
});

const MarkdownTextImpl: TextMessagePartComponent = ({text, status}) => (
  <Markdown
    autolink="gfm"
    contentWidth="100%"
    density="compact"
    headingLevelStart={3}
    isStreaming={status.type === 'running'}>
    {text}
  </Markdown>
);

export const MarkdownText = memo(MarkdownTextImpl);
MarkdownText.displayName = 'MarkdownText';

const ReasoningImpl: ReasoningMessagePartComponent = ({text, status}) => {
  if (text.length === 0) {
    return null;
  }
  const isRunning = status.type === 'running';
  return (
    <Collapsible
      defaultIsOpen={isRunning}
      trigger={
        <HStack align="center" gap={1}>
          <Icon
            color={isRunning ? 'accent' : 'secondary'}
            icon="info"
            size="sm"
          />
          <Text type="label">{isRunning ? 'Reasoning…' : 'Reasoning'}</Text>
        </HStack>
      }>
      <Markdown contentWidth="100%" density="compact" headingLevelStart={4}>
        {text}
      </Markdown>
    </Collapsible>
  );
};

export const Reasoning = memo(ReasoningImpl);
Reasoning.displayName = 'Reasoning';

const ReasoningGroupImpl: ReasoningGroupComponent = ({children}) => (
  <Collapsible defaultIsOpen trigger="Reasoning">
    <VStack gap={2}>{children}</VStack>
  </Collapsible>
);

export const ReasoningGroup = memo(ReasoningGroupImpl);
ReasoningGroup.displayName = 'ReasoningGroup';

export function formatTimingMs(milliseconds: number | undefined): string {
  if (milliseconds === undefined) {
    return '—';
  }
  if (milliseconds < 1000) {
    return `${Math.round(milliseconds)}ms`;
  }
  return `${(milliseconds / 1000).toFixed(2)}s`;
}

export interface MessageTimingProps {
  placement?: 'above' | 'below' | 'start' | 'end';
}

export const MessageTiming: FC<MessageTimingProps> = ({placement = 'end'}) => {
  const timing = useMessageTiming();
  if (timing?.totalStreamTime === undefined) {
    return null;
  }
  const summary = [
    `First token: ${formatTimingMs(timing.firstTokenTime)}`,
    `Total: ${formatTimingMs(timing.totalStreamTime)}`,
    timing.tokensPerSecond == null
      ? null
      : `Speed: ${timing.tokensPerSecond.toFixed(1)} tokens per second`,
    `Chunks: ${timing.totalChunks}`,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Tooltip content={summary} placement={placement}>
      <Badge
        aria-label="Message timing"
        label={formatTimingMs(timing.totalStreamTime)}
        variant="neutral"
        xstyle={styles.timing}
      />
    </Tooltip>
  );
};

export interface TokenUsage {
  totalTokens?: number;
  inputTokens?: number;
  cachedInputTokens?: number;
  outputTokens?: number;
  reasoningTokens?: number;
}

export interface ContextDisplayProps {
  modelContextWindow: number;
  usage?: TokenUsage;
  variant?: 'bar' | 'text';
}

/**
 * Runtime-neutral context window display. Adapters can pass token usage from
 * any model SDK without coupling this package to a specific transport.
 */
export function ContextDisplay({
  modelContextWindow,
  usage,
  variant = 'bar',
}: ContextDisplayProps) {
  const totalTokens = usage?.totalTokens ?? 0;
  const percent = Math.min(
    100,
    modelContextWindow > 0 ? (totalTokens / modelContextWindow) * 100 : 0,
  );
  const progressVariant =
    percent > 85 ? 'error' : percent >= 65 ? 'warning' : 'accent';
  const compactValue = `${totalTokens.toLocaleString()} / ${modelContextWindow.toLocaleString()}`;

  if (variant === 'text') {
    return (
      <Badge
        label={`${compactValue} tokens`}
        variant={progressVariant === 'accent' ? 'neutral' : progressVariant}
      />
    );
  }

  return (
    <VStack gap={1} xstyle={styles.contextPanel}>
      <ProgressBar
        formatValueLabel={() => `${Math.round(percent)}%`}
        hasValueLabel
        label="Context usage"
        max={modelContextWindow}
        value={totalTokens}
        variant={progressVariant}
      />
      <Text color="secondary" type="supporting">
        {compactValue} tokens
      </Text>
    </VStack>
  );
}

const QuoteBlockImpl: QuoteMessagePartComponent = ({text}) => (
  <Blockquote>{text}</Blockquote>
);

export const QuoteBlock = memo(QuoteBlockImpl);
QuoteBlock.displayName = 'QuoteBlock';

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export interface SourceProps {
  url: string;
  title?: string;
  faviconURL?: (domain: string) => string;
}

export function Source({url, title, faviconURL}: SourceProps) {
  const domain = extractDomain(url);
  const iconURL = faviconURL?.(domain);
  return (
    <Link href={url} isExternalLink label={title ?? domain}>
      <HStack align="center" gap={1}>
        {iconURL != null ? (
          <img alt="" src={iconURL} {...stylex.props(styles.sourceIcon)} />
        ) : (
          <Icon icon="externalLink" size="xsm" />
        )}
        {title ?? domain}
      </HStack>
    </Link>
  );
}

const SourcesImpl: SourceMessagePartComponent = part => {
  if (part.sourceType === 'url' && part.url != null) {
    return <Source title={part.title} url={part.url} />;
  }
  if (part.sourceType === 'document') {
    return (
      <Badge
        icon={<Icon icon="info" size="xsm" />}
        label={part.title}
        variant="neutral"
      />
    );
  }
  return null;
};

export const Sources = memo(SourcesImpl);
Sources.displayName = 'Sources';

const ImageImpl: ImageMessagePartComponent = ({image, filename}) => (
  <img
    alt={filename ?? 'Generated image'}
    src={image}
    {...stylex.props(styles.image)}
  />
);

export const Image = memo(ImageImpl);
Image.displayName = 'Image';

export function getBase64Size(value: string): number {
  const commaIndex = value.indexOf(',');
  const base64 = commaIndex >= 0 ? value.slice(commaIndex + 1) : value;
  const padding = (base64.match(/=/g) ?? []).length;
  return Math.max(0, Math.floor((base64.length * 3) / 4) - padding);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const FileImpl: FileMessagePartComponent = ({filename, data, mimeType}) => {
  const href = data.startsWith('data:')
    ? data
    : `data:${mimeType};base64,${data}`;
  return (
    <Item
      description={formatFileSize(getBase64Size(data))}
      endContent={
        <Link href={href} label={`Download ${filename ?? 'file'}`}>
          Download
        </Link>
      }
      label={filename ?? 'Unnamed file'}
      startContent={<Icon color="secondary" icon="info" size="md" />}
      xstyle={styles.fileRow}
    />
  );
};

export const File = memo(FileImpl);
File.displayName = 'File';

export interface CreateDirectiveTextOptions {
  renderIcon?: (type: string) => ReactNode;
}

export function createDirectiveText(
  formatter: Unstable_DirectiveFormatter,
  options?: CreateDirectiveTextOptions,
): TextMessagePartComponent {
  const Component: TextMessagePartComponent = ({text}) => {
    const segments = formatter.parse(text);
    return (
      <span {...stylex.props(styles.directiveText)}>
        {segments.map((segment, index) =>
          segment.kind === 'text' ? (
            <span key={index}>{segment.text}</span>
          ) : (
            <Badge
              aria-label={`${segment.type}: ${segment.label}`}
              data-directive-id={segment.id}
              data-directive-type={segment.type}
              icon={options?.renderIcon?.(segment.type)}
              key={index}
              label={segment.label}
              variant="info"
            />
          ),
        )}
      </span>
    );
  };
  Component.displayName = 'DirectiveText';
  return Component;
}

const DirectiveTextImpl = createDirectiveText(
  unstable_defaultDirectiveFormatter,
);

export const DirectiveText = memo(DirectiveTextImpl);
DirectiveText.displayName = 'DirectiveText';

export type QuoteBlockProps = ComponentProps<typeof Blockquote>;
