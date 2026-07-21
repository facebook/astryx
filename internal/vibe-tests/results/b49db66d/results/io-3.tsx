import React, {useState, useRef, useCallback} from 'react';
import {Button} from '@astryxdesign/core/Button';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {Text} from '@astryxdesign/core/Text';
import {Card} from '@astryxdesign/core/Card';
import {Banner} from '@astryxdesign/core/Banner';
import stylex from '@stylexjs/stylex';

const styles = stylex.create({
  container: { maxWidth: 400, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 },
});

function UploadIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M4 19h16v-7h2v8a1 1 0 01-1 1H3a1 1 0 01-1-1v-8h2v7zm9-10v8h-2V9H6l6-6 6 6h-5z"/></svg>; }

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

export default function FileUpload() {
  const [state, setState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback((file: File) => {
    setFileName(file.name); setState('uploading'); setProgress(0);
    let cur = 0;
    const iv = setInterval(() => {
      cur += Math.random() * 15 + 5;
      if (cur >= 100) { clearInterval(iv); setState(Math.random() > 0.2 ? 'success' : 'error'); cur = 100; }
      setProgress(Math.min(cur, 100));
    }, 300);
  }, []);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (f) upload(f);
  }, [upload]);

  const reset = useCallback(() => { setState('idle'); setProgress(0); setFileName(null); if (inputRef.current) inputRef.current.value = ''; }, []);

  return (
    <Card xstyle={styles.container}>
      <input ref={inputRef} type="file" onChange={handleFile} style={{display: 'none'}} aria-hidden="true" />
      {state === 'idle' && <Button label="Upload file" icon={<UploadIcon />} variant="primary" onClick={() => inputRef.current?.click()} />}
      {state === 'uploading' && <><Text type="label">{fileName}</Text><ProgressBar label={`Uploading ${fileName}`} value={Math.round(progress)} hasValueLabel /></>}
      {state === 'success' && <><Banner status="success" title="Upload complete" description={`${fileName} uploaded.`} /><Button label="Upload another" variant="secondary" onClick={reset} /></>}
      {state === 'error' && <><Banner status="error" title="Upload failed" description="Server error." /><Button label="Retry" variant="secondary" onClick={() => fileName && upload({name: fileName} as File)} /><Button label="Cancel" variant="ghost" onClick={reset} /></>}
    </Card>
  );
}
