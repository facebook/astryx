import type {Meta, StoryObj} from '@storybook/react';
import {useState, useRef, useEffect, useCallback} from 'react';
import {XDSCodeEditor} from '@xds/lab';

const meta: Meta<typeof XDSCodeEditor> = {
  title: 'Performance/XDSCodeEditor',
  component: XDSCodeEditor,
  parameters: {layout: 'fullscreen'},
};

export default meta;
type Story = StoryObj<typeof XDSCodeEditor>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateCode(lineCount: number): string {
  const lines: string[] = [];
  for (let i = 0; i < lineCount; i++) {
    const mod = i % 6;
    if (mod === 0) lines.push(`import {Component${i}} from './module${i}';`);
    else if (mod === 1) lines.push(`const value${i} = ${i} + Math.random();`);
    else if (mod === 2) lines.push(`function compute${i}(x: number): number {`);
    else if (mod === 3)
      lines.push(`  return x * ${i} + value${Math.max(0, i - 2)};`);
    else if (mod === 4) lines.push(`}`);
    else lines.push(`// Line ${i + 1}: performance test`);
  }
  return lines.join('\n');
}

function Metric({label, value}: {label: string; value: string | number}) {
  return (
    <div
      style={{
        display: 'inline-flex',
        gap: 4,
        padding: '2px 8px',
        borderRadius: 4,
        background: '#f0f0f0',
        fontSize: 12,
        fontFamily: 'monospace',
      }}>
      <span style={{color: '#666'}}>{label}:</span>
      <strong>{value}</strong>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stress Test — single editor, configurable line count
// ---------------------------------------------------------------------------

function StressTestImpl() {
  const [lineCount, setLineCount] = useState(500);
  const [mode, setMode] = useState<'auto' | 'ranges' | 'spans'>('auto');
  const [code, setCode] = useState(() => generateCode(500));
  const [mountTime, setMountTime] = useState<number | null>(null);
  const mountStart = useRef(0);

  useEffect(() => {
    mountStart.current = performance.now();
  }, [code]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMountTime(performance.now() - mountStart.current);
    });
    return () => cancelAnimationFrame(frame);
  }, [code]);

  const regenerate = useCallback((count: number) => {
    setLineCount(count);
    setCode(generateCode(count));
  }, []);

  return (
    <div
      style={{padding: 16, display: 'flex', flexDirection: 'column', gap: 12}}>
      <div
        style={{
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}>
        <span style={{fontSize: 13, fontWeight: 600}}>Lines:</span>
        {[100, 500, 1000, 2000, 5000].map(n => (
          <button
            key={n}
            onClick={() => regenerate(n)}
            style={{
              padding: '4px 10px',
              borderRadius: 4,
              border: lineCount === n ? '2px solid #0066cc' : '1px solid #ccc',
              background: lineCount === n ? '#e6f0ff' : 'white',
              cursor: 'pointer',
              fontSize: 12,
            }}>
            {n}
          </button>
        ))}
        <span style={{fontSize: 13, fontWeight: 600, marginLeft: 12}}>
          Mode:
        </span>
        {(['auto', 'ranges', 'spans'] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              padding: '4px 10px',
              borderRadius: 4,
              border: mode === m ? '2px solid #0066cc' : '1px solid #ccc',
              background: mode === m ? '#e6f0ff' : 'white',
              cursor: 'pointer',
              fontSize: 12,
            }}>
            {m}
          </button>
        ))}
        {mountTime != null && (
          <Metric label="Mount" value={`${mountTime.toFixed(1)}ms`} />
        )}
      </div>
      <XDSCodeEditor
        value={code}
        onChange={setCode}
        language="typescript"
        hasLineNumbers
        highlightMode={mode}
        maxHeight={600}
      />
    </div>
  );
}

export const StressTest: Story = {
  render: () => <StressTestImpl />,
};

// ---------------------------------------------------------------------------
// Side by Side — ranges vs spans
// ---------------------------------------------------------------------------

function SideBySideImpl() {
  const [lineCount, setLineCount] = useState(500);
  const initialCode = generateCode(500);
  const [codeA, setCodeA] = useState(initialCode);
  const [codeB, setCodeB] = useState(initialCode);
  const [mountA, setMountA] = useState<number | null>(null);
  const [mountB, setMountB] = useState<number | null>(null);
  const startA = useRef(0);
  const startB = useRef(0);

  useEffect(() => {
    startA.current = performance.now();
    startB.current = performance.now();
  }, [lineCount]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const now = performance.now();
      setMountA(now - startA.current);
      setMountB(now - startB.current);
    });
    return () => cancelAnimationFrame(frame);
  }, [lineCount]);

  const regenerate = useCallback((count: number) => {
    setLineCount(count);
    const c = generateCode(count);
    setCodeA(c);
    setCodeB(c);
  }, []);

  return (
    <div
      style={{padding: 16, display: 'flex', flexDirection: 'column', gap: 12}}>
      <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
        <span style={{fontSize: 13, fontWeight: 600}}>Lines:</span>
        {[100, 500, 1000, 2000].map(n => (
          <button
            key={n}
            onClick={() => regenerate(n)}
            style={{
              padding: '4px 10px',
              borderRadius: 4,
              border: lineCount === n ? '2px solid #0066cc' : '1px solid #ccc',
              background: lineCount === n ? '#e6f0ff' : 'white',
              cursor: 'pointer',
              fontSize: 12,
            }}>
            {n}
          </button>
        ))}
      </div>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16}}>
        <div>
          <div
            style={{
              display: 'flex',
              gap: 8,
              marginBottom: 8,
              alignItems: 'center',
            }}>
            <strong style={{fontSize: 13}}>Ranges (CSS Highlight API)</strong>
            {mountA != null && (
              <Metric label="Mount" value={`${mountA.toFixed(1)}ms`} />
            )}
          </div>
          <XDSCodeEditor
            value={codeA}
            onChange={setCodeA}
            language="typescript"
            hasLineNumbers
            highlightMode="ranges"
            maxHeight={500}
          />
        </div>
        <div>
          <div
            style={{
              display: 'flex',
              gap: 8,
              marginBottom: 8,
              alignItems: 'center',
            }}>
            <strong style={{fontSize: 13}}>Spans (overlay)</strong>
            {mountB != null && (
              <Metric label="Mount" value={`${mountB.toFixed(1)}ms`} />
            )}
          </div>
          <XDSCodeEditor
            value={codeB}
            onChange={setCodeB}
            language="typescript"
            hasLineNumbers
            highlightMode="spans"
            maxHeight={500}
          />
        </div>
      </div>
    </div>
  );
}

export const SideBySide: Story = {
  render: () => <SideBySideImpl />,
};

// ---------------------------------------------------------------------------
// Typing Latency — measure input responsiveness
// ---------------------------------------------------------------------------

function TypingLatencyImpl() {
  const [lineCount, setLineCount] = useState(500);
  const [mode, setMode] = useState<'auto' | 'ranges' | 'spans'>('auto');
  const [code, setCode] = useState(() => generateCode(500));
  const [latencies, setLatencies] = useState<number[]>([]);
  const lastInput = useRef(0);

  const handleChange = useCallback((val: string) => {
    const now = performance.now();
    if (lastInput.current > 0) {
      const dt = now - lastInput.current;
      // Only record if this looks like a keystroke (< 500ms gap)
      if (dt < 500) {
        setLatencies(prev => [...prev.slice(-49), dt]);
      }
    }
    lastInput.current = now;
    setCode(val);
  }, []);

  const avgLatency =
    latencies.length > 0
      ? latencies.reduce((a, b) => a + b, 0) / latencies.length
      : 0;
  const maxLatency = latencies.length > 0 ? Math.max(...latencies) : 0;

  const regenerate = useCallback((count: number) => {
    setLineCount(count);
    setCode(generateCode(count));
    setLatencies([]);
  }, []);

  return (
    <div
      style={{padding: 16, display: 'flex', flexDirection: 'column', gap: 12}}>
      <div
        style={{
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}>
        <span style={{fontSize: 13, fontWeight: 600}}>Lines:</span>
        {[100, 500, 1000, 2000].map(n => (
          <button
            key={n}
            onClick={() => regenerate(n)}
            style={{
              padding: '4px 10px',
              borderRadius: 4,
              border: lineCount === n ? '2px solid #0066cc' : '1px solid #ccc',
              background: lineCount === n ? '#e6f0ff' : 'white',
              cursor: 'pointer',
              fontSize: 12,
            }}>
            {n}
          </button>
        ))}
        <span style={{fontSize: 13, fontWeight: 600, marginLeft: 12}}>
          Mode:
        </span>
        {(['auto', 'ranges', 'spans'] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              padding: '4px 10px',
              borderRadius: 4,
              border: mode === m ? '2px solid #0066cc' : '1px solid #ccc',
              background: mode === m ? '#e6f0ff' : 'white',
              cursor: 'pointer',
              fontSize: 12,
            }}>
            {m}
          </button>
        ))}
        <Metric label="Avg" value={`${avgLatency.toFixed(1)}ms`} />
        <Metric label="Max" value={`${maxLatency.toFixed(1)}ms`} />
        <Metric label="Samples" value={latencies.length} />
        <span style={{fontSize: 11, color: '#888'}}>
          Type in the editor to measure input latency
        </span>
      </div>
      <XDSCodeEditor
        value={code}
        onChange={handleChange}
        language="typescript"
        hasLineNumbers
        highlightMode={mode}
        maxHeight={600}
      />
    </div>
  );
}

export const TypingLatency: Story = {
  render: () => <TypingLatencyImpl />,
};
