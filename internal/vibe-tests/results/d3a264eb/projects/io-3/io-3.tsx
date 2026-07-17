// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState, useCallback} from 'react';

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
    <div style={{maxWidth: 480, padding: 24}}>
      <label htmlFor="file-input" style={{display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8}}>Choose file to upload</label>
      <input id="file-input" type="file" accept="image/*,.pdf" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setStatus('idle'); }} style={{marginBottom: 12}} />
      {file && status === 'idle' && (
        <button onClick={handleUpload} style={{padding: '8px 16px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer'}}>Upload</button>
      )}
      {status === 'uploading' && (
        <div style={{marginTop: 12}}>
          <div style={{height: 8, borderRadius: 4, background: '#e2e8f0', overflow: 'hidden'}}>
            <div style={{height: '100%', width: `${progress}%`, background: '#4f46e5', transition: 'width 0.2s'}} />
          </div>
          <p style={{fontSize: 12, color: '#64748b', marginTop: 4}}>{progress}% complete</p>
        </div>
      )}
      {status === 'done' && <p style={{color: '#16a34a', marginTop: 12}}>File uploaded.</p>}
      {status === 'error' && <p style={{color: '#dc2626', marginTop: 12}}>Upload failed.</p>}
    </div>
  );
}
