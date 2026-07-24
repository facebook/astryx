// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState, useCallback} from 'react';
import {Stack} from '@astryxdesign/core/Stack';
import {Text, Heading} from '@astryxdesign/core/Text';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Badge} from '@astryxdesign/core/Badge';

interface FileUpload {
  name: string;
  size: number;
  progress: number;
  status: 'uploading' | 'complete' | 'error';
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {return `${bytes} B`;}
  if (bytes < 1024 * 1024) {return `${(bytes / 1024).toFixed(1)} KB`;}
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUploadComponent() {
  const [files, setFiles] = useState<FileUpload[]>([
    {name: 'report-q4.pdf', size: 2400000, progress: 75, status: 'uploading'},
    {name: 'screenshot.png', size: 540000, progress: 100, status: 'complete'},
    {name: 'data.csv', size: 12000, progress: 30, status: 'uploading'},
  ]);

  const handleCancel = useCallback((fileName: string) => {
    setFiles(prev => prev.filter(f => f.name !== fileName));
  }, []);

  return (
    <Stack gap={4} padding={4}>
      <Heading level={2}>File Upload</Heading>
      <Stack gap={3}>
        {files.map(file => (
          <Card key={file.name} padding={3}>
            <Stack gap={2}>
              <Stack direction="row" justify="between" align="center">
                <Stack gap={0.5}>
                  <Text weight="semibold">{file.name}</Text>
                  <Text size="sm" color="secondary">{formatFileSize(file.size)}</Text>
                </Stack>
                <Badge
                  label={file.status === 'complete' ? 'Done' : `${file.progress}%`}
                />
              </Stack>
              <ProgressBar value={file.progress} max={100} label={`Uploading ${file.name}`} />
              {file.status === 'uploading' && (
                <Button label="Cancel" variant="ghost" size="sm" onClick={() => handleCancel(file.name)} />
              )}
            </Stack>
          </Card>
        ))}
      </Stack>
      <Button label="Upload Files" variant="primary" />
    </Stack>
  );
}

export default FileUploadComponent;
