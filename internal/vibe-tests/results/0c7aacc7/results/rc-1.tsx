// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';

const navItems = [
  {label: 'Home', href: '/'},
  {label: 'Products', href: '/products'},
  {label: 'About', href: '/about'},
  {label: 'Contact', href: '/contact'},
];

export default function ResponsiveNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <nav style={{borderBottom: '1px solid #ddd', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <span style={{fontWeight: 'bold', fontSize: 18}}>Logo</span>
        <div className="desktop-links" style={{display: 'flex', gap: 24}}>
          {navItems.map(item => (
            <a key={item.href} href={item.href} style={{textDecoration: 'none', color: '#333', fontSize: 14, fontWeight: 500}}>{item.label}</a>
          ))}
        </div>
        <button className="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu" style={{display: 'none', background: 'none', border: 'none', fontSize: 24, cursor: 'pointer'}}>
          &#9776;
        </button>
      </nav>
      {isMenuOpen && (
        <div style={{position: 'fixed', inset: 0, backgroundColor: '#fff', zIndex: 100, padding: 24, display: 'flex', flexDirection: 'column', gap: 16}}>
          <button onClick={() => setIsMenuOpen(false)} style={{alignSelf: 'flex-end', background: 'none', border: 'none', fontSize: 24, cursor: 'pointer'}} aria-label="Close menu">&#10005;</button>
          {navItems.map(item => (
            <a key={item.href} href={item.href} style={{textDecoration: 'none', color: '#333', fontSize: 18, fontWeight: 500}}>{item.label}</a>
          ))}
        </div>
      )}
      <style>{`
        @media (max-width: 768px) {
          .desktop-links { display: none !important; }
          .hamburger { display: block !important; }
        }
      `}</style>
    </>
  );
}
