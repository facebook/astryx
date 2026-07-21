import React, {useState, useRef, useCallback} from 'react';

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

export default function FileUpload() {
  const [state, setState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string|null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback((file: File) => {
    setFileName(file.name); setState('uploading'); setProgress(0);
    let cur = 0;
    const iv = setInterval(() => { cur += Math.random()*15+5; if(cur>=100){clearInterval(iv);setState(Math.random()>0.2?'success':'error');cur=100;} setProgress(Math.min(cur,100)); }, 300);
  }, []);
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => { const f=e.target.files?.[0]; if(f) upload(f); };
  const reset = () => { setState('idle'); setProgress(0); setFileName(null); if(inputRef.current) inputRef.current.value=''; };

  return (
    <div style={{maxWidth:360,padding:24,border:'1px solid #e0e0e0',borderRadius:8}}>
      <input ref={inputRef} type="file" onChange={handleFile} style={{display:'none'}} />
      {state==='idle'&&<button onClick={()=>inputRef.current?.click()} style={{padding:'8px 20px',backgroundColor:'#0066cc',color:'#fff',border:'none',borderRadius:6,cursor:'pointer'}}>Upload file</button>}
      {state==='uploading'&&<div><p style={{fontSize:14,marginBottom:8}}>{fileName}</p><div style={{height:8,background:'#e0e0e0',borderRadius:4,overflow:'hidden'}}><div style={{height:'100%',width:`${progress}%`,background:'#0066cc',transition:'width 0.3s'}} /></div><p style={{fontSize:12,color:'#666',marginTop:4}}>{Math.round(progress)}%</p></div>}
      {state==='success'&&<div><p style={{color:'#2e7d32',fontWeight:500,marginBottom:8}}>Upload complete: {fileName}</p><button onClick={reset} style={{padding:'6px 12px',border:'1px solid #ccc',borderRadius:4,cursor:'pointer'}}>Upload another</button></div>}
      {state==='error'&&<div><p style={{color:'#d32f2f',fontWeight:500,marginBottom:8}}>Upload failed</p><button onClick={()=>fileName&&upload({name:fileName} as File)} style={{padding:'6px 12px',border:'1px solid #ccc',borderRadius:4,cursor:'pointer',marginRight:8}}>Retry</button><button onClick={reset} style={{padding:'6px 12px',border:'none',background:'none',cursor:'pointer'}}>Cancel</button></div>}
    </div>
  );
}
