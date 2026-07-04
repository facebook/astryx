export default function ArticlePage() {
  return (
    <article style={{maxWidth: 720, margin: '0 auto', padding: 24}}>
      <h1 style={{fontSize: 48, fontWeight: 700, lineHeight: 1.1, marginBottom: 16}}>The Future of Design Systems in Modern Web Development</h1>
      <p style={{fontSize: 20, color: '#666', marginBottom: 16}}>How component libraries are reshaping the way teams build consistent, accessible UIs at scale.</p>
      <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24}}>
        <div style={{width: 40, height: 40, borderRadius: '50%', background: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 500}}>SC</div>
        <div><p style={{fontWeight: 500}}>Sarah Chen</p><p style={{fontSize: 14, color: '#999'}}>Jan 15, 2024 · 8 min read</p></div>
      </div>
      <hr style={{border: 'none', borderTop: '1px solid #e0e0e0', marginBottom: 24}} />
      <img src="https://picsum.photos/1200/600?random=10" alt="Design system" style={{width: '100%', height: 400, objectFit: 'cover', borderRadius: 12, marginBottom: 24}} />
      <p style={{marginBottom: 16, lineHeight: 1.6}}>Design systems have become the foundation of modern web development.</p>
      <p style={{marginBottom: 16, lineHeight: 1.6}}>At their core, they are collections of reusable components.</p>
      <h2 style={{fontSize: 28, fontWeight: 700, marginTop: 32, marginBottom: 12}}>The Evolution of Component Architecture</h2>
      <p style={{marginBottom: 16, lineHeight: 1.6}}>The shift toward modular systems reflects a broader trend.</p>
      <blockquote style={{borderLeft: '4px solid #333', paddingLeft: 24, margin: '32px 0', fontStyle: 'italic', fontSize: 18}}>A good design system is invisible.</blockquote>
      <p style={{marginBottom: 16, lineHeight: 1.6}}>Component-driven development encourages thinking in building blocks.</p>
      <h2 style={{fontSize: 28, fontWeight: 700, marginTop: 32, marginBottom: 12}}>Accessibility as a Foundation</h2>
      <p style={{marginBottom: 16, lineHeight: 1.6}}>When built into the system, every product inherits guarantees.</p>
      <h2 style={{fontSize: 28, fontWeight: 700, marginTop: 32, marginBottom: 12}}>Looking Ahead</h2>
      <p style={{lineHeight: 1.6}}>The next wave will incorporate AI, dynamic theming, and cross-platform consistency.</p>
    </article>
  );
}
