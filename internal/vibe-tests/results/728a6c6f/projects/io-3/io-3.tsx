// Copyright (c) Meta Platforms, Inc. and affiliates.

import React, {useState, useRef} from 'react';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {Progress} from '@/components/ui/progress';

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setStatus('uploading');
      setProgress(0);
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener('progress', (e) => { if (e.lengthComputable) {setProgress(Math.round((e.loaded / e.total) * 100));} });
      xhr.addEventListener('load', () => { setStatus('done'); setProgress(100); });
      xhr.addEventListener('error', () => setStatus('error'));
      xhr.open('POST', '/api/upload');
      const fd = new FormData(); fd.append('file', selected); xhr.send(fd);
    }
  };

  return (
    <Card className="w-96">
      <CardContent className="pt-6 space-y-3">
        <p className="font-medium">Upload a file</p>
        <input ref={inputRef} type="file" onChange={handleFileChange} className="hidden" />
        <Button variant="outline" onClick={() => inputRef.current?.click()} disabled={status === 'uploading'}>
          {status === 'uploading' ? 'Uploading...' : file ? file.name : 'Choose File'}
        </Button>
        {status === 'uploading' && (
          <div className="space-y-1">
            <Progress value={progress} />
            <p className="text-xs text-muted-foreground">{progress}% uploaded</p>
          </div>
        )}
        {status === 'done' && <p className="text-sm text-green-600">Upload complete.</p>}
        {status === 'error' && <p className="text-sm text-red-600">Upload failed. Try again.</p>}
      </CardContent>
    </Card>
  );
}
