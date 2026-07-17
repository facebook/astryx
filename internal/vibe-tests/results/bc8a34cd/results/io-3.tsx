// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState, useCallback} from 'react';
import {FileInput} from '@astryxdesign/core/FileInput';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {Button} from '@astryxdesign/core/Button';
import {Text} from '@astryxdesign/core/Text';
import {Banner} from '@astryxdesign/core/Banner';

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
      <FileInput
        label="Choose file to upload"
        value={file}
        onChange={(f) => { setFile(f as File | null); setStatus('idle'); }}
        accept="image/*,.pdf"
        maxSize={10 * 1024 * 1024}
      />
      {file && status === 'idle' && (
        <Button label="Upload" variant="primary" onClick={handleUpload} />
      )}
      {status === 'uploading' && (
        <div className="space-y-1">
          <ProgressBar label="Uploading" value={progress} hasValueLabel />
          <Text type="supporting">{progress}% complete</Text>
        </div>
      )}
      {status === 'done' && <Banner variant="success">File uploaded.</Banner>}
      {status === 'error' && <Banner variant="error">Upload failed.</Banner>}
    </div>
  );
}
