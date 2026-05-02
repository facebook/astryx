import * as stylex from '@stylexjs/stylex';
import {templates, templateCount} from '../../generated/templateRegistry';

const styles = stylex.create({
  page: {padding: '2rem', maxWidth: 960, marginInline: 'auto'},
  heading: {fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem'},
  count: {fontSize: '0.875rem', opacity: 0.5, marginBottom: '2rem'},
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1rem',
  },
  card: {
    padding: '1.25rem',
    borderRadius: 8,
    border: '1px solid var(--color-border)',
  },
  cardName: {fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem'},
  cardDesc: {fontSize: '0.8125rem', opacity: 0.7, lineHeight: 1.5},
});

export default function TemplatesPage() {
  return (
    <div {...stylex.props(styles.page)}>
      <h1 {...stylex.props(styles.heading)}>Templates</h1>
      <p {...stylex.props(styles.count)}>{templateCount} page templates</p>
      <div {...stylex.props(styles.grid)}>
        {templates.map(t => (
          <div key={t.slug} {...stylex.props(styles.card)}>
            <div {...stylex.props(styles.cardName)}>{t.name}</div>
            <div {...stylex.props(styles.cardDesc)}>{t.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
