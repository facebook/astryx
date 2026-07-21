import React from 'react';

const data = [
  {id:'1',title:'Getting Started with React 19',type:'Article',author:'Jane Smith',date:'2024-06-15'},
  {id:'2',title:'Advanced TypeScript Patterns',type:'Video',author:'Bob Chen',date:'2024-06-12'},
  {id:'3',title:'Design Systems Deep Dive',type:'Podcast',author:'Alice Park',date:'2024-06-10'},
  {id:'4',title:'Weekly Product Update',type:'Newsletter',author:'Team',date:'2024-06-08'},
  {id:'5',title:'Building Accessible UIs',type:'Webinar',author:'Sam Lee',date:'2024-06-05'},
  {id:'6',title:'CSS-in-JS Performance',type:'Article',author:'Chris Wang',date:'2024-06-03'},
  {id:'7',title:'State Management in 2024',type:'Video',author:'Dana Fox',date:'2024-06-01'},
  {id:'8',title:'Interview: Framework Authors',type:'Podcast',author:'Alex Kim',date:'2024-05-28'},
];
const COLORS: Record<string,string> = {Article:'#e3f2fd',Video:'#f3e5f5',Podcast:'#e0f2f1',Newsletter:'#fff3e0',Webinar:'#e8f5e9'};
const TEXT: Record<string,string> = {Article:'#1565c0',Video:'#7b1fa2',Podcast:'#00695c',Newsletter:'#e65100',Webinar:'#2e7d32'};

export default function ContentLibrary() {
  return (
    <div style={{padding:24,maxWidth:800}}>
      <h2 style={{marginBottom:16}}>Content Library</h2>
      <table style={{width:'100%',borderCollapse:'collapse'}}>
        <thead><tr style={{borderBottom:'2px solid #e0e0e0',textAlign:'left'}}><th style={{padding:8}}>Title</th><th style={{padding:8}}>Type</th><th style={{padding:8}}>Author</th><th style={{padding:8}}>Date</th></tr></thead>
        <tbody>{data.map(r=><tr key={r.id} style={{borderBottom:'1px solid #f5f5f5'}}><td style={{padding:8}}>{r.title}</td><td style={{padding:8}}><span style={{padding:'2px 10px',borderRadius:12,fontSize:12,fontWeight:500,backgroundColor:COLORS[r.type],color:TEXT[r.type]}}>{r.type}</span></td><td style={{padding:8}}>{r.author}</td><td style={{padding:8}}>{r.date}</td></tr>)}</tbody>
      </table>
    </div>
  );
}
