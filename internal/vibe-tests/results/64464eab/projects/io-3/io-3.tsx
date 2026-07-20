import {useState, useRef} from 'react';
import {Button} from '@/components/ui/button';
import {Progress} from '@/components/ui/progress';

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
    <div className="space-y-3">
      <input ref={inputRef} type="file" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
      <Button onClick={() => inputRef.current?.click()} disabled={uploading}>{uploading ? 'Uploading...' : 'Upload File'}</Button>
      {uploading && <div className="space-y-1"><p className="text-sm text-muted-foreground">{fileName}</p><Progress value={progress} /><p className="text-xs text-muted-foreground">{progress}%</p></div>}
    </div>
  );
}
