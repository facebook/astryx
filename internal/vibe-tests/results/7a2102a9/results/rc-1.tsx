import {useState} from 'react';

const NAV_ITEMS = ['Home', 'Products', 'About', 'Contact'];

export default function ResponsiveNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav style={{fontFamily: 'system-ui'}}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #eee'}}>
        <span style={{fontWeight: 700, fontSize: 18}}>Logo</span>
        <div className="nav-desktop" style={{display: 'flex', gap: 8}}>
          {NAV_ITEMS.map(item => <a key={item} href="#" style={{padding: '6px 12px', textDecoration: 'none', color: '#333'}}>{item}</a>)}
        </div>
        <button className="nav-mobile" onClick={() => setIsOpen(!isOpen)} style={{display: 'none', background: 'none', border: 'none', fontSize: 24, cursor: 'pointer'}}>☰</button>
      </div>
      {isOpen && <div style={{display: 'flex', flexDirection: 'column', padding: 16, borderBottom: '1px solid #eee'}}>
        {NAV_ITEMS.map(item => <a key={item} href="#" style={{padding: 8, textDecoration: 'none', color: '#333'}}>{item}</a>)}
      </div>}
      <style>{`@media(max-width:768px){.nav-desktop{display:none!important}.nav-mobile{display:block!important}}`}</style>
    </nav>
  );
}
