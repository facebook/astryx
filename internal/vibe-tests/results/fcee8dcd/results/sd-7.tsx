// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState, useCallback} from 'react';

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
    <div style={{padding: 24, maxWidth: 480, margin: '0 auto', fontFamily: 'system-ui, sans-serif'}}>
      <h2 style={{margin: '0 0 24px', fontSize: 24, fontWeight: 700}}>File Upload</h2>
      <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
        {files.map(file => (
          <div key={file.name} style={{border: '1px solid #e5e7eb', borderRadius: 8, padding: 16}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}>
              <div>
                <p style={{margin: 0, fontWeight: 500}}>{file.name}</p>
                <p style={{margin: 0, fontSize: 12, color: '#666'}}>{formatFileSize(file.size)}</p>
              </div>
              <span style={{padding: '2px 8px', borderRadius: 12, fontSize: 12, backgroundColor: file.status === 'complete' ? '#dcfce7' : '#f3f4f6'}}>
                {file.status === 'complete' ? 'Done' : `${file.progress}%`}
              </span>
            </div>
            <div style={{height: 6, backgroundColor: '#e5e7eb', borderRadius: 3, overflow: 'hidden'}}>
              <div style={{height: '100%', width: `${file.progress}%`, backgroundColor: file.status === 'complete' ? '#22c55e' : '#2563eb', borderRadius: 3, transition: 'width 0.3s'}} />
            </div>
            {file.status === 'uploading' && (
              <button onClick={() => handleCancel(file.name)} style={{marginTop: 8, padding: '4px 8px', border: 'none', backgroundColor: 'transparent', color: '#666', cursor: 'pointer', fontSize: 13}}>Cancel</button>
            )}
          </div>
        ))}
      </div>
      <button style={{marginTop: 16, padding: '10px 20px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 500}}>Upload Files</button>
    </div>
  );
}

export default FileUploadComponent;
