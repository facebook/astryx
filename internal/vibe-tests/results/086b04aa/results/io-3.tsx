// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState, useCallback} from 'react';
import {FileInput} from '@astryxdesign/core/FileInput';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {VStack} from '@astryxdesign/core/Stack';
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
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      });

      await new Promise<void>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {resolve();}
          else {reject(new Error('Upload failed'));}
        };
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
    <VStack gap={3} maxWidth={500} padding={4}>
      <FileInput
        label="Choose file to upload"
        value={file}
        onChange={(f) => {
          setFile(f as File | null);
          setStatus('idle');
          setProgress(0);
        }}
        accept="image/*,.pdf,.doc,.docx"
        maxSize={10 * 1024 * 1024}
      />
      {file && status === 'idle' && (
        <Button label="Upload" variant="primary" onClick={handleUpload} />
      )}
      {status === 'uploading' && (
        <VStack gap={1}>
          <ProgressBar label="Uploading" value={progress} hasValueLabel />
          <Text type="supporting">{progress}% complete</Text>
        </VStack>
      )}
      {status === 'done' && (
        <Banner variant="success">File uploaded.</Banner>
      )}
      {status === 'error' && (
        <Banner variant="error">Upload failed. Try again.</Banner>
      )}
    </VStack>
  );
}
