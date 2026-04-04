import type {Meta, StoryObj} from '@storybook/react';
import {useCallback, useEffect, useRef, useState} from 'react';
import {useXDSStreamingText} from '@xds/core/hooks';
import {XDSText} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSStack} from '@xds/core/Stack';

interface StreamingDemoProps {
  text: string;
  speed: 'natural' | 'fast' | 'instant';
  chunkSize: number;
  chunkIntervalMs: number;
}

function StreamingDemo({
  text,
  speed,
  chunkSize,
  chunkIntervalMs,
}: StreamingDemoProps) {
  const [target, setTarget] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const displayed = useXDSStreamingText(target, isStreaming, {speed});

  const start = useCallback(() => {
    indexRef.current = 0;
    setTarget('');
    setIsStreaming(true);

    timerRef.current = setInterval(() => {
      indexRef.current = Math.min(indexRef.current + chunkSize, text.length);
      setTarget(text.slice(0, indexRef.current));

      if (indexRef.current >= text.length) {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
        setTimeout(() => setIsStreaming(false), 200);
      }
    }, chunkIntervalMs);
  }, [text, chunkSize, chunkIntervalMs]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <XDSStack gap="md">
      <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
        <XDSButton label="Start streaming" onPress={start}>
          {isStreaming ? 'Streaming\u2026' : 'Start'}
        </XDSButton>
        <XDSText type="detail" color="secondary">
          speed: {speed} \u00b7 chunk: {chunkSize} chars every {chunkIntervalMs}ms
        </XDSText>
      </div>
      <div
        style={{
          padding: 16,
          borderRadius: 8,
          background: 'var(--xds-color-bg-secondary, #f5f5f5)',
          minHeight: 80,
          whiteSpace: 'pre-wrap',
        }}>
        <XDSText type="body">{displayed || '\u00a0'}</XDSText>
      </div>
      <XDSText type="detail" color="secondary">
        {displayed.length} / {target.length} chars displayed
        {isStreaming ? ' \u00b7 streaming' : target.length > 0 ? ' \u00b7 done' : ''}
      </XDSText>
    </XDSStack>
  );
}

const SAMPLE_MARKDOWN = `# Welcome to XDS

XDS is a **design system** for building internal tools. It provides:

- **Open internals** \u2014 all primitives are exported and composable
- **Plugin architecture** \u2014 transform and extend components
- **Automatic spacing** \u2014 context-aware spacing compensation
- **AI-ready** \u2014 JSDoc annotations with composition hints

\`\`\`tsx
import { XDSButton } from '@xds/core/Button';

function App() {
  return <XDSButton label="Click me">Hello</XDSButton>;
}
\`\`\`

> "Good design systems don't constrain \u2014 they accelerate."`;

const SAMPLE_SHORT = 'Hello, world! This is a short streaming demo.';

const meta: Meta<typeof StreamingDemo> = {
  title: 'Hooks/useXDSStreamingText',
  component: StreamingDemo,
  tags: ['autodocs'],
  argTypes: {
    speed: {
      control: 'select',
      options: ['natural', 'fast', 'instant'],
    },
    chunkSize: {
      control: {type: 'range', min: 1, max: 100, step: 1},
    },
    chunkIntervalMs: {
      control: {type: 'range', min: 10, max: 500, step: 10},
    },
    text: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof StreamingDemo>;

export const Natural: Story = {
  args: {
    text: SAMPLE_MARKDOWN,
    speed: 'natural',
    chunkSize: 20,
    chunkIntervalMs: 50,
  },
};

export const Fast: Story = {
  args: {
    text: SAMPLE_MARKDOWN,
    speed: 'fast',
    chunkSize: 20,
    chunkIntervalMs: 50,
  },
};

export const Instant: Story = {
  args: {
    text: SAMPLE_SHORT,
    speed: 'instant',
    chunkSize: 20,
    chunkIntervalMs: 50,
  },
};

export const BurstyChunks: Story = {
  name: 'Bursty chunks (large backlog)',
  args: {
    text: SAMPLE_MARKDOWN,
    speed: 'natural',
    chunkSize: 80,
    chunkIntervalMs: 200,
  },
};

export const SlowTrickle: Story = {
  name: 'Slow trickle (1 char at a time)',
  args: {
    text: SAMPLE_SHORT,
    speed: 'natural',
    chunkSize: 1,
    chunkIntervalMs: 100,
  },
};

export const SpeedComparison: Story = {
  render: () => {
    const text = SAMPLE_MARKDOWN;
    return (
      <XDSStack gap="lg">
        <XDSText type="heading3">Speed comparison</XDSText>
        <XDSText type="detail" color="secondary">
          Press each Start to compare the three presets side by side.
        </XDSText>
        {(['natural', 'fast', 'instant'] as const).map((speed) => (
          <div key={speed}>
            <XDSText type="label" style={{marginBottom: 4}}>
              {speed}
            </XDSText>
            <StreamingDemo
              text={text}
              speed={speed}
              chunkSize={20}
              chunkIntervalMs={50}
            />
          </div>
        ))}
      </XDSStack>
    );
  },
};
