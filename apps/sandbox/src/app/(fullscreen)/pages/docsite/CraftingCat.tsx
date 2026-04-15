'use client';

import React, {useState, useEffect} from 'react';

const FRAMES = [
  '      /\\_/\\\n     ( o.o )\n   \u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510\n   \u2502 \u258b       \u2502\n   \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518\n   /| \u2550\u2550\u2550\u2550\u2550\u2550\u2550 |\\',
  '      /\\_/\\\n     ( o.o )\n   \u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510\n   \u2502 _\u258b      \u2502\n   \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518\n   \\| \u2550\u2550\u2550\u2550\u2550\u2550\u2550 |/',
  '      /\\_/\\\n     ( -.- )\n   \u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510\n   \u2502 __\u258b     \u2502\n   \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518\n   /| \u2550\u2550\u2550\u2550\u2550\u2550\u2550 |\\',
  '      /\\_/\\\n     ( o.o )\n   \u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510\n   \u2502 ___\u258b    \u2502\n   \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518\n   \\| \u2550\u2550\u2550\u2550\u2550\u2550\u2550 |/',
  '      /\\_/\\\n     ( o.o )\n   \u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510\n   \u2502 ____\u258b   \u2502\n   \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518\n   /| \u2550\u2550\u2550\u2550\u2550\u2550\u2550 |\\',
  '      /\\_/\\\n     ( ^.^ )\n   \u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510\n   \u2502 \u258b       \u2502\n   \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518\n   \\| \u2550\u2550\u2550\u2550\u2550\u2550\u2550 |/',
];

export function CraftingCat() {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setFrame(prev => (prev + 1) % FRAMES.length);
    }, 350);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <style>{`
        @keyframes craftingShimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          backgroundColor: 'var(--color-background-surface, #fff)',
        }}>
        <pre
          style={{
            fontFamily:
              '"JetBrains Mono", "Fira Code", "SF Mono", "Cascadia Code", monospace',
            fontSize: 18,
            lineHeight: 1.35,
            color: 'var(--color-text-secondary, #65676B)',
            margin: 0,
          }}>
          {FRAMES[frame]}
        </pre>
        <span
          style={{
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: 0.5,
            background:
              'linear-gradient(90deg, var(--color-text-secondary, #65676B) 40%, var(--color-text-primary, #111) 50%, var(--color-text-secondary, #65676B) 60%)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'craftingShimmer 2s linear infinite',
          }}>
          Crafting your UI...
        </span>
      </div>
    </>
  );
}
