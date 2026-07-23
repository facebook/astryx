// Copyright (c) Meta Platforms, Inc. and affiliates.

import React, {useState, useRef} from 'react';

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
    <div style={{width: 400, border: '1px solid #e5e5e5', borderRadius: 8, padding: 20, fontFamily: 'system-ui'}}>
      <p style={{margin: '0 0 12px', fontWeight: 500}}>Upload a file</p>
      <input ref={inputRef} type="file" onChange={handleFileChange} style={{display: 'none'}} />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={status === 'uploading'}
        style={{padding: '8px 16px', border: '1px solid #ddd', borderRadius: 6, cursor: status === 'uploading' ? 'not-allowed' : 'pointer', background: '#fff', fontSize: 14}}
      >
        {status === 'uploading' ? 'Uploading...' : file ? file.name : 'Choose File'}
      </button>
      {status === 'uploading' && (
        <div style={{marginTop: 12}}>
          <div style={{height: 8, backgroundColor: '#f0f0f0', borderRadius: 4, overflow: 'hidden'}}>
            <div style={{height: '100%', width: `${progress}%`, backgroundColor: '#0066cc', borderRadius: 4, transition: 'width 0.3s'}} />
          </div>
          <p style={{fontSize: 12, color: '#666', marginTop: 4}}>{progress}% uploaded</p>
        </div>
      )}
      {status === 'done' && <p style={{fontSize: 14, color: '#16a34a', marginTop: 8}}>Upload complete.</p>}
      {status === 'error' && <p style={{fontSize: 14, color: '#dc2626', marginTop: 8}}>Upload failed. Try again.</p>}
    </div>
  );
}
