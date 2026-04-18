'use client';

import {useState} from 'react';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSButton} from '@xds/core/Button';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSBadge} from '@xds/core/Badge';
import {XDSCard} from '@xds/core/Card';
import {XDSDivider} from '@xds/core';
import {XDSAvatar} from '@xds/core/Avatar';

/* ─── Shadcn-style Tailwind components ─────────────────── */

function TailwindCard({children}: {children: React.ReactNode}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
      {children}
    </div>
  );
}

function TailwindButton({
  children,
  variant = 'default',
}: {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost';
}) {
  const variants = {
    default:
      'bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-50 dark:text-gray-900',
    outline:
      'border border-gray-200 bg-transparent hover:bg-gray-100 dark:border-gray-700',
    ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800',
  };
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors ${variants[variant]}`}>
      {children}
    </button>
  );
}

/* ─── Page ─────────────────────────────────────────────── */

export default function Home() {
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');

  return (
    <main className="min-h-screen bg-[var(--color-background-body)] p-8">
      <div className="mx-auto max-w-3xl">
        <XDSVStack gap={8}>
          <XDSVStack gap={2}>
            <XDSHeading level={1}>XDS + Tailwind</XDSHeading>
            <XDSText type="body" color="secondary">
              Pre-built dist package — no StyleX plugin needed. Tailwind handles
              layout, XDS handles components and tokens.
            </XDSText>
          </XDSVStack>

          <XDSDivider />

          {/* Tailwind utilities on XDS components */}
          <XDSVStack gap={3}>
            <XDSHeading level={2}>Tailwind on XDS components</XDSHeading>
            <XDSCard className="border-2 border-blue-500 shadow-lg">
              <XDSText type="body">
                XDSCard with{' '}
                <code className="rounded bg-gray-100 px-1 py-0.5 text-sm">
                  border-2 border-blue-500 shadow-lg
                </code>
              </XDSText>
            </XDSCard>
            <XDSHStack gap={3} vAlign="center">
              <XDSButton
                label="Rounded Full"
                variant="primary"
                className="rounded-full"
              />
              <XDSButton
                label="Uppercase"
                variant="ghost"
                className="uppercase tracking-wider"
              />
            </XDSHStack>
            <XDSText type="body" className="text-blue-600 italic">
              XDSText with text-blue-600 and italic
            </XDSText>
          </XDSVStack>

          <XDSDivider />

          {/* XDS tokens in Tailwind arbitrary values */}
          <XDSVStack gap={3}>
            <XDSHeading level={2}>XDS tokens in Tailwind</XDSHeading>
            <div className="rounded-[var(--radius-container)] border border-[var(--color-border)] bg-[var(--color-background-surface)] p-[var(--spacing-4)]">
              <p className="text-[var(--color-text-primary)] text-[var(--font-size-base)]">
                Card built with Tailwind using XDS tokens via{' '}
                <code className="text-[var(--font-size-sm)] text-[var(--color-text-secondary)]">
                  var(--radius-container)
                </code>
                , etc.
              </p>
            </div>
            <div className="flex gap-[var(--spacing-3)]">
              <div className="h-12 w-12 rounded-[var(--radius-element)] bg-[var(--color-accent)]" />
              <div className="h-12 w-12 rounded-[var(--radius-element)] bg-[var(--color-success)]" />
              <div className="h-12 w-12 rounded-[var(--radius-element)] bg-[var(--color-error)]" />
              <div className="h-12 w-12 rounded-[var(--radius-element)] bg-[var(--color-warning)]" />
            </div>
          </XDSVStack>

          <XDSDivider />

          {/* Shadcn-style components alongside XDS */}
          <XDSVStack gap={3}>
            <XDSHeading level={2}>Shadcn-style components</XDSHeading>
            <div className="grid grid-cols-2 gap-6">
              <XDSCard>
                <XDSVStack gap={3}>
                  <XDSHStack gap={2} vAlign="center">
                    <XDSAvatar name="Jane Doe" size="small" />
                    <XDSVStack gap={0}>
                      <XDSText type="label">Jane Doe</XDSText>
                      <XDSText type="supporting" color="secondary">
                        Engineer
                      </XDSText>
                    </XDSVStack>
                  </XDSHStack>
                  <XDSHStack gap={2}>
                    <XDSBadge variant="info" label="React" />
                    <XDSBadge variant="success" label="TS" />
                  </XDSHStack>
                  <XDSButton label="View Profile" variant="secondary" />
                </XDSVStack>
              </XDSCard>

              <TailwindCard>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-medium text-white">
                      JD
                    </div>
                    <div>
                      <p className="text-sm font-medium">Jane Doe</p>
                      <p className="text-xs text-gray-500">Engineer</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                      React
                    </span>
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      TS
                    </span>
                  </div>
                  <TailwindButton variant="outline">
                    View Profile
                  </TailwindButton>
                </div>
              </TailwindCard>
            </div>
          </XDSVStack>

          <XDSDivider />

          {/* Forms */}
          <XDSVStack gap={3}>
            <XDSHeading level={2}>Form elements</XDSHeading>
            <div className="grid grid-cols-2 gap-6">
              <XDSVStack gap={3}>
                <XDSTextInput
                  label="XDS Input"
                  placeholder="Enter name"
                  value={input1}
                  onChange={setInput1}
                />
                <XDSTextInput
                  label="XDS Email"
                  placeholder="you@example.com"
                  value={input2}
                  onChange={setInput2}
                />
              </XDSVStack>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Tailwind Input</label>
                  <input
                    type="text"
                    placeholder="Enter name"
                    className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Tailwind Email</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>
          </XDSVStack>

          <XDSDivider />

          {/* Typography */}
          <XDSVStack gap={3}>
            <XDSHeading level={2}>Typography</XDSHeading>
            <div className="grid grid-cols-2 gap-6">
              <XDSVStack gap={2}>
                <XDSHeading level={1}>Heading 1</XDSHeading>
                <XDSHeading level={2}>Heading 2</XDSHeading>
                <XDSHeading level={3}>Heading 3</XDSHeading>
                <XDSText type="body">Body text</XDSText>
                <XDSText type="supporting" color="secondary">
                  Supporting text
                </XDSText>
              </XDSVStack>
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold">Heading 1</h1>
                <h2 className="text-2xl font-semibold">Heading 2</h2>
                <h3 className="text-xl font-semibold">Heading 3</h3>
                <p className="text-base">Body text</p>
                <p className="text-sm text-gray-500">Supporting text</p>
                <ul className="list-disc pl-5 text-sm">
                  <li>List item</li>
                  <li>List item</li>
                </ul>
              </div>
            </div>
          </XDSVStack>
        </XDSVStack>
      </div>
    </main>
  );
}
