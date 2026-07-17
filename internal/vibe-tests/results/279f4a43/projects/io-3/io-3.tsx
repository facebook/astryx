// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState, useCallback} from 'react';
import {Input} from '../components/ui/input';
import {Button} from '../components/ui/button';
import {Label} from '../components/ui/label';
import {Progress} from '../components/ui/progress';
import {Alert, AlertDescription} from '../components/ui/alert';

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');

  const handleUpload = useCallback(async () => {
    if (!file) {return;}
    setStatus('uploading');
    setProgress(0);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {setProgress(Math.round((e.loaded / e.total) * 100));}
      });
      await new Promise<void>((resolve, reject) => {
        xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error('Failed'));
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.open('POST', '/api/upload');
        xhr.send(formData);
      });
      setStatus('done');
    } catch {
      setStatus('error');
    }
  }, [file]);

  return (
    <div className="max-w-lg space-y-4 p-6">
      <div className="space-y-2">
        <Label htmlFor="file">Choose file to upload</Label>
        <Input id="file" type="file" accept="image/*,.pdf" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setStatus('idle'); }} />
      </div>
      {file && status === 'idle' && <Button onClick={handleUpload}>Upload</Button>}
      {status === 'uploading' && (
        <div className="space-y-1">
          <Progress value={progress} />
          <p className="text-xs text-muted-foreground">{progress}% complete</p>
        </div>
      )}
      {status === 'done' && <Alert><AlertDescription>File uploaded.</AlertDescription></Alert>}
      {status === 'error' && <Alert variant="destructive"><AlertDescription>Upload failed.</AlertDescription></Alert>}
    </div>
  );
}
