import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  page: {padding: '2rem', maxWidth: 720, marginInline: 'auto'},
  heading: {fontSize: '2rem', fontWeight: 700, marginBottom: '1rem'},
});

export default function GettingStarted() {
  return (
    <div {...stylex.props(styles.page)}>
      <h1 {...stylex.props(styles.heading)}>Getting Started</h1>
      <p>Getting started guide coming soon.</p>
    </div>
  );
}
