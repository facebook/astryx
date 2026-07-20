import {useState, useRef} from 'react';

export default function FileUpload() {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setFileName(file.name);
    setUploading(true);
    setProgress(0);
    for (let i = 0; i <= 100; i += 10) { await new Promise(r => setTimeout(r, 200)); setProgress(i); }
    try { const fd = new FormData(); fd.append('file', file); await fetch('/api/upload', {method: 'POST', body: fd}); } catch {}
    setUploading(false);
  };

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
      <input ref={inputRef} type="file" style={{display: 'none'}} onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
      <button onClick={() => inputRef.current?.click()} disabled={uploading} style={{padding: '8px 16px', background: '#1976d2', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', opacity: uploading ? 0.6 : 1}}>{uploading ? 'Uploading...' : 'Upload File'}</button>
      {uploading && (
        <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
          <span style={{fontSize: 14, color: '#666'}}>{fileName}</span>
          <div style={{width: '100%', height: 8, background: '#f0f0f0', borderRadius: 4, overflow: 'hidden'}}><div style={{width: `${progress}%`, height: '100%', background: '#1976d2', transition: 'width 0.2s'}} /></div>
          <span style={{fontSize: 12, color: '#666'}}>{progress}%</span>
        </div>
      )}
    </div>
  );
}
