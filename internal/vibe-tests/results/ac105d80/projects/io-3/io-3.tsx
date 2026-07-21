import React, {useState, useRef, useCallback} from 'react';
import {Button} from '@/components/ui/button';
import {Progress} from '@/components/ui/progress';
import {Card, CardContent} from '@/components/ui/card';

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

export default function FileUpload() {
  const [state, setState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback((file: File) => {
    setFileName(file.name); setState('uploading'); setProgress(0);
    let cur = 0;
    const iv = setInterval(() => { cur += Math.random() * 15 + 5; if (cur >= 100) { clearInterval(iv); setState(Math.random() > 0.2 ? 'success' : 'error'); cur = 100; } setProgress(Math.min(cur, 100)); }, 300);
  }, []);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) upload(f); }, [upload]);
  const reset = useCallback(() => { setState('idle'); setProgress(0); setFileName(null); if (inputRef.current) inputRef.current.value = ''; }, []);

  return (
    <Card className="max-w-sm"><CardContent className="p-6 space-y-4">
      <input ref={inputRef} type="file" onChange={handleFile} className="hidden" />
      {state === 'idle' && <Button onClick={() => inputRef.current?.click()}>Upload file</Button>}
      {state === 'uploading' && <><p className="text-sm font-medium">{fileName}</p><Progress value={progress} /><p className="text-xs text-muted-foreground">{Math.round(progress)}%</p></>}
      {state === 'success' && <><div className="text-sm text-green-600 font-medium">Upload complete: {fileName}</div><Button variant="outline" onClick={reset}>Upload another</Button></>}
      {state === 'error' && <><div className="text-sm text-destructive font-medium">Upload failed</div><Button variant="outline" onClick={() => fileName && upload({name: fileName} as File)}>Retry</Button><Button variant="ghost" onClick={reset}>Cancel</Button></>}
    </CardContent></Card>
  );
}
