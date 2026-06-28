// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState, useRef} from 'react';

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) { setFile(selected); setStatus('idle'); setProgress(0); }
  }

  async function handleUpload() {
    if (!file) {return;}
    setStatus('uploading');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (e) => { if (e.lengthComputable) {setProgress(Math.round((e.loaded / e.total) * 100));} };
      await new Promise<void>((resolve, reject) => {
        xhr.onload = () => (xhr.status < 400 ? resolve() : reject());
        xhr.onerror = reject;
        xhr.open('POST', '/api/upload');
        xhr.send(formData);
      });
      setStatus('done');
    } catch { setStatus('error'); }
  }

  return (
    <div style={{maxWidth: 400, padding: 16}}>
      <input ref={inputRef} type="file" onChange={handleFileSelect} style={{display: 'none'}} />
      <button onClick={() => inputRef.current?.click()} style={{padding: '8px 16px', border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8}}>
        &#8593; Choose File
      </button>
      {file && (
        <div style={{marginTop: 12}}>
          <p style={{fontSize: 13, color: '#666'}}>{file.name} ({(file.size / 1024).toFixed(1)} KB)</p>
          {status === 'uploading' && (
            <div style={{height: 8, backgroundColor: '#eee', borderRadius: 4, marginTop: 8, overflow: 'hidden'}}>
              <div style={{height: '100%', width: `${progress}%`, backgroundColor: '#0066cc', transition: 'width 0.3s'}} role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} />
            </div>
          )}
          {status === 'done' && <p style={{color: 'green', marginTop: 8}}>&#10003; Upload complete</p>}
          {status === 'error' && <p style={{color: 'red', marginTop: 8}}>Upload failed. Please try again.</p>}
          <button onClick={handleUpload} disabled={status === 'uploading' || status === 'done'} style={{marginTop: 8, padding: '8px 16px', backgroundColor: '#0066cc', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', opacity: status === 'uploading' || status === 'done' ? 0.5 : 1}}>
            {status === 'uploading' ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      )}
    </div>
  );
}
