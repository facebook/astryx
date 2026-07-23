// Copyright (c) Meta Platforms, Inc. and affiliates.

import React, {useState, useRef} from 'react';
import {Button} from '@astryxdesign/core/Button';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {Card} from '@astryxdesign/core/Card';
import {Text} from '@astryxdesign/core/Text';

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
    <Card width={400}>
      <div className="flex flex-col gap-3">
        <Text type="body">Upload a file</Text>
        <input ref={inputRef} type="file" onChange={handleFileChange} className="hidden" />
        <Button label={file ? file.name : 'Choose File'} variant="secondary" onClick={() => inputRef.current?.click()} isDisabled={status === 'uploading'} isLoading={status === 'uploading'} />
        {status === 'uploading' && (
          <div className="flex flex-col gap-1">
            <ProgressBar value={progress} max={100} label="Upload progress" />
            <Text type="supporting">{progress}% uploaded</Text>
          </div>
        )}
        {status === 'done' && <Text type="supporting">Upload complete.</Text>}
        {status === 'error' && <Text type="supporting">Upload failed. Try again.</Text>}
      </div>
    </Card>
  );
}
