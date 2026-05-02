import * as stylex from '@stylexjs/stylex';
import {notFound} from 'next/navigation';
import {packages} from '../../../generated/packageRegistry';

const styles = stylex.create({
  page: {padding: '2rem', maxWidth: 720, marginInline: 'auto'},
  heading: {fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem'},
  description: {opacity: 0.7, marginBottom: '0.5rem'},
  version: {fontSize: '0.875rem', opacity: 0.5, marginBottom: '2rem'},
});

export function generateStaticParams() {
  return packages.map(p => ({name: encodeURIComponent(p.name)}));
}

export default async function PackagePage({
  params,
}: {
  params: Promise<{name: string}>;
}) {
  const {name: encodedName} = await params;
  const pkg = packages.find(p => encodeURIComponent(p.name) === encodedName);
  if (!pkg) notFound();

  return (
    <div {...stylex.props(styles.page)}>
      <h1 {...stylex.props(styles.heading)}>{pkg.name}</h1>
      <p {...stylex.props(styles.description)}>{pkg.description}</p>
      <p {...stylex.props(styles.version)}>v{pkg.version}</p>
    </div>
  );
}
