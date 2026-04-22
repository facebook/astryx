'use client';

import React from 'react';

const SHAPES = [
  {
    gradient: 'linear-gradient(135deg, #F5B8C8, #FDCEB0)',
    size: 22,
    radius: '50%' as const,
    delay: 0,
  },
  {
    gradient: 'linear-gradient(135deg, #A8E6CF, #A0D2F5)',
    size: 22,
    radius: 5,
    delay: 0.12,
  },
  {
    gradient: 'linear-gradient(135deg, #C4B8F5, #F2B5D4)',
    size: 22,
    radius: '50%' as const,
    delay: 0.24,
  },
  {
    gradient: 'linear-gradient(135deg, #80D8C4, #FFE0A3)',
    size: 22,
    radius: 5,
    delay: 0.36,
  },
];

export function CraftingCat() {
  return (
    <>
      <style>{`
        @keyframes craftBounce {
          0%, 100% { transform: translateY(0); }
          40% { transform: translateY(-36px); }
          55% { transform: translateY(-2px); }
          70% { transform: translateY(-14px); }
        }
        @keyframes craftShadow {
          0%, 100% { transform: scaleX(1); opacity: 0.15; }
          40% { transform: scaleX(0.4); opacity: 0.05; }
          55% { transform: scaleX(0.95); opacity: 0.14; }
          70% { transform: scaleX(0.6); opacity: 0.08; }
        }
        @keyframes craftPulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
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
          backgroundColor: 'var(--color-background-surface, #fff)',
        }}>
        <div
          style={{
            display: 'flex',
            gap: 20,
            alignItems: 'flex-end',
            height: 80,
          }}>
          {SHAPES.map((s, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}>
              <div
                style={{
                  width: s.size,
                  height: s.size,
                  borderRadius: s.radius,
                  background: s.gradient,
                  animation: `craftBounce 2s cubic-bezier(0.34, 1.56, 0.64, 1) ${s.delay}s infinite`,
                }}
              />
              <div
                style={{
                  width: 14,
                  height: 4,
                  borderRadius: '50%',
                  background: 'var(--color-text-quaternary, rgba(0,0,0,0.08))',
                  marginTop: 8,
                  animation: `craftShadow 2s ease-in-out ${s.delay}s infinite`,
                }}
              />
            </div>
          ))}
        </div>
        <span
          style={{
            marginTop: 24,
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: 0.3,
            color: 'var(--color-text-secondary, #65676B)',
            animation: 'craftPulse 2s ease-in-out infinite',
          }}>
          Crafting your layout...
        </span>
      </div>
    </>
  );
}
