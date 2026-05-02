import * as stylex from '@stylexjs/stylex';
import Link from 'next/link';
import {packages} from '../generated/packageRegistry';
import {components, componentCount} from '../generated/componentRegistry';
import {blockCount, showcaseCount} from '../generated/blockRegistry';
import {templateCount} from '../generated/templateRegistry';
import {docsCount} from '../generated/docsRegistry';

const styles = stylex.create({
  page: {
    padding: '2rem',
    maxWidth: 960,
    marginInline: 'auto',
  },
  heading: {
    fontSize: '2.5rem',
    fontWeight: 700,
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '1.125rem',
    opacity: 0.7,
    marginBottom: '2.5rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '1rem',
    marginBottom: '2.5rem',
  },
  stat: {
    padding: '1.25rem',
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    textAlign: 'center' as const,
  },
  statNumber: {
    fontSize: '2rem',
    fontWeight: 700,
    lineHeight: 1,
  },
  statLabel: {
    fontSize: '0.75rem',
    opacity: 0.6,
    marginTop: '0.25rem',
  },
  section: {
    marginBottom: '2rem',
  },
  sectionHeading: {
    fontSize: '1.25rem',
    fontWeight: 600,
    marginBottom: '0.75rem',
  },
  packageGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1rem',
  },
  packageCard: {
    padding: '1.25rem',
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    textDecoration: 'none',
    color: 'inherit',
    display: 'block',
  },
  packageName: {
    fontSize: '0.9375rem',
    fontWeight: 600,
    marginBottom: '0.25rem',
  },
  packageDesc: {
    fontSize: '0.8125rem',
    opacity: 0.7,
    lineHeight: 1.5,
  },
  packageVersion: {
    fontSize: '0.75rem',
    opacity: 0.4,
    marginTop: '0.5rem',
  },
  quickLinks: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap' as const,
    marginBottom: '2.5rem',
  },
  quickLink: {
    fontSize: '0.875rem',
    padding: '0.5rem 1rem',
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    textDecoration: 'none',
    color: 'inherit',
  },
});

const themeCount = packages.filter(p => p.name.includes('theme-')).length;
const componentPackages = Object.keys(components);

export default function Home() {
  return (
    <div {...stylex.props(styles.page)}>
      <h1 {...stylex.props(styles.heading)}>XDS</h1>
      <p {...stylex.props(styles.subtitle)}>
        Open-source design system for building internal tools and products.
      </p>

      <div {...stylex.props(styles.quickLinks)}>
        <Link href="/getting-started" {...stylex.props(styles.quickLink)}>
          Getting Started →
        </Link>
        <Link href="/whats-new" {...stylex.props(styles.quickLink)}>
          What's New →
        </Link>
        <Link href="/components/Button" {...stylex.props(styles.quickLink)}>
          Components →
        </Link>
        <Link href="/templates" {...stylex.props(styles.quickLink)}>
          Templates →
        </Link>
      </div>

      <div {...stylex.props(styles.grid)}>
        <Stat n={componentCount} label="Components" />
        <Stat n={blockCount} label="Blocks" />
        <Stat n={showcaseCount} label="Showcases" />
        <Stat n={templateCount} label="Templates" />
        <Stat n={themeCount} label="Themes" />
        <Stat n={docsCount} label="Doc Topics" />
      </div>

      <div {...stylex.props(styles.section)}>
        <h2 {...stylex.props(styles.sectionHeading)}>Packages</h2>
        <div {...stylex.props(styles.packageGrid)}>
          {packages.map(p => (
            <Link
              key={p.name}
              href={`/packages/${encodeURIComponent(p.name)}`}
              {...stylex.props(styles.packageCard)}>
              <div {...stylex.props(styles.packageName)}>{p.name}</div>
              <div {...stylex.props(styles.packageDesc)}>{p.description}</div>
              <div {...stylex.props(styles.packageVersion)}>v{p.version}</div>
            </Link>
          ))}
        </div>
      </div>

      <div {...stylex.props(styles.section)}>
        <h2 {...stylex.props(styles.sectionHeading)}>Components by Package</h2>
        <div {...stylex.props(styles.grid)}>
          {componentPackages.map(pkg => (
            <div key={pkg} {...stylex.props(styles.stat)}>
              <div {...stylex.props(styles.statNumber)}>
                {components[pkg].length}
              </div>
              <div {...stylex.props(styles.statLabel)}>
                {pkg.replace('@xds/', '')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({n, label}: {n: number; label: string}) {
  return (
    <div {...stylex.props(styles.stat)}>
      <div {...stylex.props(styles.statNumber)}>{n}</div>
      <div {...stylex.props(styles.statLabel)}>{label}</div>
    </div>
  );
}
