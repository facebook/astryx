import * as stylex from '@stylexjs/stylex';
import {notFound} from 'next/navigation';
import {components} from '../../../generated/componentRegistry';

const styles = stylex.create({
  page: {padding: '2rem', maxWidth: 720, marginInline: 'auto'},
  heading: {fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem'},
  displayName: {
    fontSize: '0.875rem',
    opacity: 0.5,
    fontFamily: 'monospace',
    marginBottom: '0.5rem',
  },
  description: {opacity: 0.7, marginBottom: '1rem', lineHeight: 1.6},
  meta: {fontSize: '0.8125rem', opacity: 0.5, display: 'flex', gap: '1rem'},
});

const allComponents = Object.values(components).flat();

export function generateStaticParams() {
  return allComponents.filter(c => !c.parentDoc).map(c => ({name: c.name}));
}

export default async function ComponentPage({
  params,
}: {
  params: Promise<{name: string}>;
}) {
  const {name} = await params;
  const comp = allComponents.find(c => c.name === name);
  if (!comp) notFound();

  // Find sub-components if this is a compound doc
  const subComponents = allComponents.filter(c => c.parentDoc === name);

  return (
    <div {...stylex.props(styles.page)}>
      <p {...stylex.props(styles.displayName)}>{comp.displayName}</p>
      <h1 {...stylex.props(styles.heading)}>{comp.name}</h1>
      <p {...stylex.props(styles.description)}>{comp.description}</p>
      <div {...stylex.props(styles.meta)}>
        {comp.group && <span>Group: {comp.group}</span>}
        <span>
          Package:{' '}
          {
            Object.entries(components).find(([, comps]) =>
              comps.includes(comp),
            )?.[0]
          }
        </span>
      </div>
      {subComponents.length > 0 && (
        <div style={{marginTop: '2rem'}}>
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              marginBottom: '0.75rem',
            }}>
            Sub-components ({subComponents.length})
          </h2>
          <ul>
            {subComponents.map(sub => (
              <li key={sub.name} style={{marginBottom: '0.5rem'}}>
                <strong>{sub.displayName}</strong> —{' '}
                {sub.description?.slice(0, 120)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
