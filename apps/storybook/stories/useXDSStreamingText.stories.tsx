import type {Meta, StoryObj} from '@storybook/react';
import {useCallback, useEffect, useRef, useState} from 'react';
import {useXDSStreamingText} from '@xds/core/hooks';
import {XDSText} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSVStack} from '@xds/core/Layout';

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
    if (timerRef.current) clearInterval(timerRef.current);
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
    <XDSVStack gap={4}>
      <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
        <XDSButton
          label={isStreaming ? 'Streaming...' : 'Start'}
          onClick={start}
          variant={isStreaming ? 'secondary' : 'primary'}
          isDisabled={isStreaming}
        />
        <XDSText type="supporting">
          speed: {speed} · chunk: {chunkSize} chars every {chunkIntervalMs}ms
        </XDSText>
      </div>
      <div
        style={{
          padding: 16,
          borderRadius: 8,
          background: 'var(--color-background-muted)',
          minHeight: 80,
          whiteSpace: 'pre-wrap',
          fontFamily: 'var(--font-family-body)',
        }}>
        <XDSText type="body">{displayed || '\u00a0'}</XDSText>
      </div>
      <XDSText type="supporting">
        {displayed.length} / {target.length} chars displayed
        {isStreaming ? ' · streaming' : target.length > 0 ? ' · done' : ''}
      </XDSText>
    </XDSVStack>
  );
}

const SAMPLE_TEXT = 'Here is how you fetch a user in TypeScript:\n\nconst response = await fetch("/api/users/" + id);\nconst user = await response.json();\n\nKey points:\n- Always check response.ok before parsing\n- Use AbortController for cancellation\n- Consider a useUser hook for React apps\n\nThis approach gives you type-safe API calls with proper error handling.';

const meta: Meta<typeof StreamingDemo> = {
  title: 'Hooks/useXDSStreamingText',
  component: StreamingDemo,
  tags: ['autodocs'],
  argTypes: {
    speed: {control: 'select', options: ['natural', 'fast', 'instant']},
    chunkSize: {control: {type: 'range', min: 1, max: 100, step: 1}},
    chunkIntervalMs: {control: {type: 'range', min: 10, max: 500, step: 10}},
    text: {control: 'text'},
  },
};

export default meta;
type Story = StoryObj<typeof StreamingDemo>;

export const Natural: Story = {
  args: {text: SAMPLE_TEXT, speed: 'natural', chunkSize: 20, chunkIntervalMs: 50},
};

export const Fast: Story = {
  args: {text: SAMPLE_TEXT, speed: 'fast', chunkSize: 20, chunkIntervalMs: 50},
};

export const Instant: Story = {
  args: {text: SAMPLE_TEXT, speed: 'instant', chunkSize: 20, chunkIntervalMs: 50},
};

export const BurstyChunks: Story = {
  name: 'Bursty chunks (large backlog)',
  args: {text: SAMPLE_TEXT, speed: 'natural', chunkSize: 80, chunkIntervalMs: 200},
};

export const SlowTrickle: Story = {
  name: 'Slow trickle',
  args: {text: SAMPLE_TEXT, speed: 'natural', chunkSize: 1, chunkIntervalMs: 100},
};
