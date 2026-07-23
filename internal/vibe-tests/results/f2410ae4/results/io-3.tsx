// Copyright (c) Meta Platforms, Inc. and affiliates.

import React, {useState, useRef} from 'react';
import {Button} from '@astryxdesign/core/Button';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {VStack} from '@astryxdesign/core/VStack';
import {Text} from '@astryxdesign/core/Text';
import {Card} from '@astryxdesign/core/Card';

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelect = () => inputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      upload(selected);
    }
  };

  const upload = async (f: File) => {
    setStatus('uploading');
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', f);

      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {setProgress(Math.round((e.loaded / e.total) * 100));}
      });
      xhr.addEventListener('load', () => {
        setStatus('done');
        setProgress(100);
      });
      xhr.addEventListener('error', () => setStatus('error'));
      xhr.open('POST', '/api/upload');
      xhr.send(formData);
    } catch {
      setStatus('error');
    }
  };

  return (
    <Card width={400}>
      <VStack gap={3}>
        <Text type="body">Upload a file</Text>
        <input ref={inputRef} type="file" onChange={handleFileChange} style={{display: 'none'}} />
        <Button
          label={file ? file.name : 'Choose File'}
          variant={status === 'done' ? 'primary' : 'secondary'}
          onClick={handleSelect}
          isDisabled={status === 'uploading'}
          isLoading={status === 'uploading'}
        />
        {status === 'uploading' && (
          <VStack gap={1}>
            <ProgressBar value={progress} max={100} label="Upload progress" />
            <Text type="supporting">{progress}% uploaded</Text>
          </VStack>
        )}
        {status === 'done' && <Text type="supporting">Upload complete.</Text>}
        {status === 'error' && <Text type="supporting">Upload failed. Try again.</Text>}
      </VStack>
    </Card>
  );
}
