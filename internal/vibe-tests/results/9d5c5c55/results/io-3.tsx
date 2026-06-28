// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState, useRef} from 'react';
import {Button} from '@astryxdesign/core/Button';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {VStack} from '@astryxdesign/core/VStack';
import {HStack} from '@astryxdesign/core/HStack';
import {Text} from '@astryxdesign/core/Text';
import {Icon} from '@astryxdesign/core/Icon';

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
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
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
    <VStack gap="md" style={{maxWidth: 400}}>
      <input
        ref={inputRef}
        type="file"
        onChange={handleFileSelect}
        style={{display: 'none'}}
      />
      <Button
        label="Choose File"
        variant="secondary"
        icon={<Icon name="upload" />}
        onClick={() => inputRef.current?.click()}
      />
      {file && (
        <VStack gap="sm">
          <Text size="sm">{file.name} ({(file.size / 1024).toFixed(1)} KB)</Text>
          {status === 'uploading' && (
            <ProgressBar value={progress} max={100} label="Upload progress" />
          )}
          {status === 'done' && (
            <HStack gap="xs" align="center">
              <Icon name="check-circle" />
              <Text color="success">Upload complete</Text>
            </HStack>
          )}
          {status === 'error' && (
            <Text color="error">Upload failed. Please try again.</Text>
          )}
          <Button
            label="Upload"
            variant="primary"
            isLoading={status === 'uploading'}
            isDisabled={status === 'uploading' || status === 'done'}
            onClick={handleUpload}
          />
        </VStack>
      )}
    </VStack>
  );
}
