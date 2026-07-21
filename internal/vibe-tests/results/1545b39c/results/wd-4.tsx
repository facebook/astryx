import React, {useState, useMemo} from 'react';

interface Todo { id: string; title: string; status: 'Open' | 'Closed'; createdAt: string; updatedAt: string; isPending?: boolean; }

const initial: Todo[] = Array.from({length: 52}, (_, i) => ({id: String(i), title: `Todo ${i+1}`, status: i%3===0?'Closed':'Open', createdAt: new Date(2024,0,i+1).toISOString(), updatedAt: new Date(2024,5,i+1).toISOString()}));

export default function TodoTracker() {
  const [todos, setTodos] = useState<Todo[]>(initial);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortKey, setSortKey] = useState<'updatedAt'|'createdAt'|'title'>('updatedAt');
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('desc');
  const [page, setPage] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [deleteId, setDeleteId] = useState<string|null>(null);
  const [editId, setEditId] = useState<string|null>(null);
  const [editVal, setEditVal] = useState('');

  const filtered = useMemo(() => todos.filter(t => t.title.toLowerCase().includes(filter.toLowerCase()) && (statusFilter==='all'||t.status===statusFilter)), [todos,filter,statusFilter]);
  const sorted = useMemo(() => [...filtered].sort((a,b) => { const c = String(a[sortKey]).localeCompare(String(b[sortKey])); return sortDir==='asc'?c:-c; }), [filtered,sortKey,sortDir]);
  const paged = sorted.slice(page*25,(page+1)*25);
  const totalPages = Math.ceil(sorted.length/25);
  const toggleSort = (k: typeof sortKey) => { if(sortKey===k) setSortDir(d=>d==='asc'?'desc':'asc'); else { setSortKey(k); setSortDir('asc'); } };

  return (
    <div style={{padding:24, maxWidth:900, margin:'0 auto'}}>
      <div style={{display:'flex', gap:8, marginBottom:16}}>
        <input placeholder="Filter by title..." value={filter} onChange={e=>setFilter(e.target.value)} style={{padding:'6px 12px', border:'1px solid #ccc', borderRadius:4}} />
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={{padding:'6px 12px', border:'1px solid #ccc', borderRadius:4}}><option value="all">All</option><option value="Open">Open</option><option value="Closed">Closed</option></select>
        <button onClick={()=>setShowCreate(true)} style={{padding:'6px 16px', backgroundColor:'#0066cc', color:'#fff', border:'none', borderRadius:4, cursor:'pointer'}}>Create Todo</button>
      </div>
      <table style={{width:'100%', borderCollapse:'collapse'}}>
        <thead><tr style={{borderBottom:'2px solid #e0e0e0', textAlign:'left'}}>
          <th style={{padding:8, cursor:'pointer'}} onClick={()=>toggleSort('title')}>Title {sortKey==='title'&&(sortDir==='asc'?'↑':'↓')}</th>
          <th style={{padding:8}}>Status</th>
          <th style={{padding:8, cursor:'pointer'}} onClick={()=>toggleSort('createdAt')}>Created</th>
          <th style={{padding:8, cursor:'pointer'}} onClick={()=>toggleSort('updatedAt')}>Updated</th>
          <th style={{padding:8}}>Actions</th>
        </tr></thead>
        <tbody>{paged.map(t=><tr key={t.id} style={{borderBottom:'1px solid #f0f0f0', opacity:t.isPending?0.6:1}}>
          <td style={{padding:8}}>{editId===t.id?<span style={{display:'flex',gap:4}}><input value={editVal} onChange={e=>setEditVal(e.target.value)} style={{padding:4,border:'1px solid #ccc',borderRadius:4}} /><button onClick={()=>{setTodos(p=>p.map(x=>x.id===editId?{...x,title:editVal.trim(),updatedAt:new Date().toISOString()}:x));setEditId(null);}}>Save</button><button onClick={()=>setEditId(null)}>Cancel</button></span>:<span onDoubleClick={()=>{setEditId(t.id);setEditVal(t.title);}}>{t.title}</span>}</td>
          <td style={{padding:8}}><span style={{padding:'2px 8px',borderRadius:12,fontSize:12,backgroundColor:t.status==='Open'?'#e3f2fd':'#f5f5f5'}}>{t.status}</span></td>
          <td style={{padding:8,fontSize:13}}>{new Date(t.createdAt).toLocaleDateString()}</td>
          <td style={{padding:8,fontSize:13}}>{new Date(t.updatedAt).toLocaleDateString()}</td>
          <td style={{padding:8}}><button onClick={()=>setTodos(p=>p.map(x=>x.id===t.id?{...x,status:x.status==='Open'?'Closed':'Open',updatedAt:new Date().toISOString(),isPending:true}:x))} style={{marginRight:4,cursor:'pointer'}}>{t.status==='Open'?'Close':'Reopen'}</button><button onClick={()=>setDeleteId(t.id)} style={{color:'#d32f2f',cursor:'pointer'}}>Delete</button></td>
        </tr>)}</tbody>
      </table>
      <div style={{display:'flex',justifyContent:'center',gap:8,marginTop:16}}>
        <button disabled={page===0} onClick={()=>setPage(p=>p-1)}>Prev</button>
        <span>Page {page+1}/{totalPages}</span>
        <button disabled={page>=totalPages-1} onClick={()=>setPage(p=>p+1)}>Next</button>
      </div>
      {showCreate&&<div style={{position:'fixed',inset:0,backgroundColor:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{background:'#fff',padding:24,borderRadius:8,minWidth:300}}><h3>Create Todo</h3><input value={newTitle} onChange={e=>setNewTitle(e.target.value)} placeholder="Title" style={{width:'100%',padding:8,border:'1px solid #ccc',borderRadius:4,marginBottom:12}} /><div style={{display:'flex',gap:8,justifyContent:'flex-end'}}><button onClick={()=>setShowCreate(false)}>Cancel</button><button onClick={()=>{if(!newTitle.trim())return;const now=new Date().toISOString();setTodos(p=>[{id:crypto.randomUUID(),title:newTitle.trim(),status:'Open',createdAt:now,updatedAt:now,isPending:true},...p]);setNewTitle('');setShowCreate(false);}} style={{backgroundColor:'#0066cc',color:'#fff',border:'none',padding:'6px 16px',borderRadius:4}}>Create</button></div></div></div>}
      {deleteId&&<div style={{position:'fixed',inset:0,backgroundColor:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{background:'#fff',padding:24,borderRadius:8}}><p>Delete this todo?</p><div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:12}}><button onClick={()=>setDeleteId(null)}>Cancel</button><button onClick={()=>{setTodos(p=>p.filter(t=>t.id!==deleteId));setDeleteId(null);}} style={{backgroundColor:'#d32f2f',color:'#fff',border:'none',padding:'6px 16px',borderRadius:4}}>Delete</button></div></div></div>}
    </div>
  );
}
