import {Button, HStack, VStack, IconButton, Icon} from '@astryxdesign/core';
import {useState} from 'react';

const NAV_ITEMS = ['Home', 'Products', 'About', 'Contact'];

export default function ResponsiveNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav>
      <HStack gap={2} style={{padding: '12px 16px', borderBottom: '1px solid #eee', alignItems: 'center', justifyContent: 'space-between'}}>
        <span style={{fontWeight: 700, fontSize: 18}}>Logo</span>
        <HStack gap={2} style={{display: 'var(--nav-desktop, flex)'}}>
          {NAV_ITEMS.map(item => (
            <Button key={item} label={item} variant="ghost" size="sm" />
          ))}
        </HStack>
        <div style={{display: 'var(--nav-mobile, none)'}}>
          <IconButton icon="menu" label="Menu" variant="ghost" onPress={() => setIsOpen(!isOpen)} />
        </div>
      </HStack>
      {isOpen && (
        <VStack gap={1} style={{padding: 16, borderBottom: '1px solid #eee'}}>
          {NAV_ITEMS.map(item => (
            <Button key={item} label={item} variant="ghost" size="sm" />
          ))}
        </VStack>
      )}
      <style>{`
        @media (max-width: 768px) {
          :root { --nav-desktop: none; --nav-mobile: block; }
        }
        @media (min-width: 769px) {
          :root { --nav-desktop: flex; --nav-mobile: none; }
        }
      `}</style>
    </nav>
  );
}
