import * as stylex from '@stylexjs/stylex';
import {packages} from '../generated/packageRegistry';
import {components, componentCount} from '../generated/componentRegistry';
import {blockCount, showcaseCount} from '../generated/blockRegistry';
import {templateCount} from '../generated/templateRegistry';
import {docsCount} from '../generated/docsRegistry';

const styles = stylex.create({
  main: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '2rem',
  },
  container: {
    maxWidth: 640,
    width: '100%',
  },
  heading: {
    fontSize: '2.5rem',
    fontWeight: 700,
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '1.125rem',
    opacity: 0.7,
    marginBottom: '2rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  },
  stat: {
    padding: '1rem',
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
    marginBottom: '1.5rem',
  },
  sectionHeading: {
    fontSize: '0.875rem',
    fontWeight: 600,
    opacity: 0.5,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: '0.5rem',
  },
  packageList: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.5rem',
  },
  chip: {
    fontSize: '0.8125rem',
    padding: '0.25rem 0.75rem',
    borderRadius: 999,
    border: '1px solid var(--color-border)',
  },
});

const themeCount = packages.filter(p => p.name.includes('theme-')).length;
const componentPackages = Object.keys(components);

export default function Home() {
  return (
    <main {...stylex.props(styles.main)}>
      <div {...stylex.props(styles.container)}>
        <h1 {...stylex.props(styles.heading)}>XDS</h1>
        <p {...stylex.props(styles.subtitle)}>
          A design system for building internal tools and products.
        </p>

        <div {...stylex.props(styles.grid)}>
          <Stat n={componentCount} label="Components" />
          <Stat n={blockCount} label="Blocks" />
          <Stat n={showcaseCount} label="Showcases" />
          <Stat n={templateCount} label="Templates" />
          <Stat n={themeCount} label="Themes" />
          <Stat n={docsCount} label="Doc Topics" />
          <Stat n={packages.length} label="Packages" />
          <Stat n={componentPackages.length} label="Component Pkgs" />
        </div>

        <div {...stylex.props(styles.section)}>
          <div {...stylex.props(styles.sectionHeading)}>Packages</div>
          <div {...stylex.props(styles.packageList)}>
            {packages.map(p => (
              <span key={p.name} {...stylex.props(styles.chip)}>
                {p.name} <span style={{opacity: 0.5}}>v{p.version}</span>
              </span>
            ))}
          </div>
        </div>

        <div {...stylex.props(styles.section)}>
          <div {...stylex.props(styles.sectionHeading)}>
            Components by Package
          </div>
          <div {...stylex.props(styles.packageList)}>
            {componentPackages.map(pkg => (
              <span key={pkg} {...stylex.props(styles.chip)}>
                {pkg.replace('@xds/', '')} ({components[pkg].length})
              </span>
            ))}
          </div>
        </div>
      </div>
    </main>
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
