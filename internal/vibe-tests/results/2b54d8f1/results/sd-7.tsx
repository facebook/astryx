// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState, useCallback} from 'react';
import {Card, CardContent} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Progress} from '@/components/ui/progress';

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
    <div className="flex flex-col gap-6 p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold">File Upload</h2>
      <div className="flex flex-col gap-4">
        {files.map(file => (
          <Card key={file.name}>
            <CardContent className="p-4 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                </div>
                <Badge variant={file.status === 'complete' ? 'default' : 'outline'}>
                  {file.status === 'complete' ? 'Done' : `${file.progress}%`}
                </Badge>
              </div>
              <Progress value={file.progress} />
              {file.status === 'uploading' && (
                <Button variant="ghost" size="sm" onClick={() => handleCancel(file.name)}>Cancel</Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      <Button>Upload Files</Button>
    </div>
  );
}

export default FileUploadComponent;
