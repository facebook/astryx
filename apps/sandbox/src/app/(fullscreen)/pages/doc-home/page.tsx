// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {TextArea} from '@astryxdesign/core/TextArea';
import {categories} from '../../../sandboxPages';
import DocTopNav from '../doc-nav/DocTopNav';

const allPages = categories.flatMap(cat =>
  cat.pages.map(p => ({...p, category: cat.label})),
);

const GRID_AREAS = `"a a b b b" "c c c d d" "e f f g g" "h h i i i"`;
const GRID_ROWS = '280px 320px 260px 300px';
const AREA_KEYS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];

export default function DocHomePage() {
  const [search, setSearch] = useState('');

  const filtered = search
    ? allPages.filter(
        p =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.category.toLowerCase().includes(search.toLowerCase()),
      )
    : allPages;

  const gridItems = filtered.slice(0, 8);

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        overflow: 'hidden',
      }}>
      <DocTopNav />

      <div style={{display: 'flex', flex: 1, minHeight: 0}}>
        {/* Left Hero */}
        <div
          style={{
            flex: '0 0 380px',
            display: 'flex',
            flexDirection: 'column',
            padding: '48px 32px 32px',
          }}>
          <div style={{display: 'flex', flexDirection: 'column', gap: 20}}>
            <Heading level={1}>Endless templates for your ideas</Heading>
            <Text type="large" color="secondary">
              Explore production-ready templates, patterns, and components built
              with Astryx.
            </Text>
          </div>

          <div style={{display: 'flex', gap: 10, marginTop: 28}}>
            <Button label="Get started" variant="secondary" size="lg" />
            <Button label="Browse all" variant="ghost" size="lg" />
          </div>

          {/* Search at bottom */}
          <div style={{marginTop: 'auto', maxWidth: 360}}>
            <TextArea
              label="Search"
              isLabelHidden
              placeholder="See endless designs for..."
              value={search}
              onChange={setSearch}
              rows={2}
            />
          </div>
        </div>

        {/* Right Masonry Grid */}
        <div
          style={{
            flex: 1,
            overflow: 'hidden',
            padding: '16px 16px 16px 0',
            minWidth: 0,
          }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gridTemplateAreas: GRID_AREAS,
              gridTemplateRows: GRID_ROWS,
              gap: 12,
              height: '100%',
            }}>
            {gridItems.map((page, i) => (
              <a
                key={page.href}
                href={page.href}
                style={{
                  gridArea: AREA_KEYS[i % AREA_KEYS.length],
                  textDecoration: 'none',
                  display: 'flex',
                }}>
                <Card width="100%">
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                    }}>
                    {/* Placeholder image area */}
                    <div
                      style={{
                        flex: 1,
                        backgroundColor: '#f5f5f5',
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <svg
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#b0b0b0"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round">
                        <rect
                          x="3"
                          y="3"
                          width="18"
                          height="18"
                          rx="2"
                          ry="2"
                        />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </div>
                    {/* Label */}
                    <div style={{paddingTop: 10}}>
                      <Text type="supporting" color="secondary">
                        {page.name}
                      </Text>
                    </div>
                  </div>
                </Card>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
