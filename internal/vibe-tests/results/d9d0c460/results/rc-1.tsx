import {useState} from 'react';

const navLinks = ['Home', 'Products', 'About', 'Contact', 'Blog'];

export default function ResponsiveNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <nav style={{borderBottom: '1px solid #e0e0e0', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <span style={{fontWeight: 700, fontSize: 20}}>MyApp</span>
        <div style={{display: 'flex', gap: 8}} className="desktop-only">
          {navLinks.map(l => <button key={l} style={{padding: '6px 12px', background: 'none', border: 'none', cursor: 'pointer'}}>{l}</button>)}
        </div>
        <button onClick={() => setIsOpen(true)} style={{display: 'none', background: 'none', border: 'none', fontSize: 24, cursor: 'pointer'}} className="mobile-only" aria-label="Menu">&#9776;</button>
      </nav>
      {isOpen && (
        <div style={{position: 'fixed', inset: 0, background: 'white', zIndex: 1000, padding: 24, display: 'flex', flexDirection: 'column', gap: 12}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <span style={{fontWeight: 700, fontSize: 20}}>MyApp</span>
            <button onClick={() => setIsOpen(false)} style={{background: 'none', border: 'none', fontSize: 24, cursor: 'pointer'}} aria-label="Close">&times;</button>
          </div>
          {navLinks.map(l => <button key={l} onClick={() => setIsOpen(false)} style={{padding: '12px 16px', background: 'none', border: 'none', textAlign: 'left', fontSize: 16, cursor: 'pointer'}}>{l}</button>)}
        </div>
      )}
      <style>{`@media (max-width: 768px) { .desktop-only { display: none !important; } .mobile-only { display: block !important; } } @media (min-width: 769px) { .mobile-only { display: none !important; } }`}</style>
    </>
  );
}
