import React from 'react';

export default function HeroSection() {
  return (
    <section style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:500,padding:48,textAlign:'center',gap:24}}>
      <h1 style={{fontSize:48,fontWeight:700,margin:0,letterSpacing:'-0.02em'}}>Build faster with Astryx</h1>
      <p style={{fontSize:20,color:'#666',maxWidth:640,margin:0}}>A modern design system for building beautiful, accessible React applications at scale.</p>
      <div style={{display:'flex',gap:12}}>
        <button style={{padding:'12px 24px',fontSize:16,backgroundColor:'#0066cc',color:'#fff',border:'none',borderRadius:6,cursor:'pointer'}}>Get started</button>
        <button style={{padding:'12px 24px',fontSize:16,backgroundColor:'transparent',border:'1px solid #ccc',borderRadius:6,cursor:'pointer'}}>View docs</button>
      </div>
    </section>
  );
}
