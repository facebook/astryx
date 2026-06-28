// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState, useRef} from 'react';
import {Button} from '@/components/ui/button';
import {Progress} from '@/components/ui/progress';
import {Upload, CheckCircle, AlertCircle} from 'lucide-react';

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setStatus('idle');
      setProgress(0);
    }
  }

  async function handleUpload() {
    if (!file) {return;}
    setStatus('uploading');
    setProgress(0);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {setProgress(Math.round((e.loaded / e.total) * 100));}
      };
      await new Promise<void>((resolve, reject) => {
        xhr.onload = () => (xhr.status < 400 ? resolve() : reject());
        xhr.onerror = reject;
        xhr.open('POST', '/api/upload');
        xhr.send(formData);
      });
      setStatus('done');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="space-y-4 max-w-sm">
      <input ref={inputRef} type="file" onChange={handleFileSelect} className="hidden" />
      <Button variant="outline" onClick={() => inputRef.current?.click()}>
        <Upload className="h-4 w-4 mr-2" /> Choose File
      </Button>
      {file && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{file.name} ({(file.size / 1024).toFixed(1)} KB)</p>
          {status === 'uploading' && <Progress value={progress} />}
          {status === 'done' && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" /> Upload complete
            </div>
          )}
          {status === 'error' && (
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" /> Upload failed. Please try again.
            </div>
          )}
          <Button onClick={handleUpload} disabled={status === 'uploading' || status === 'done'}>
            {status === 'uploading' ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      )}
    </div>
  );
}
