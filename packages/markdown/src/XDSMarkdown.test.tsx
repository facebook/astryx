import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {XDSMarkdown} from './XDSMarkdown';

describe('XDSMarkdown', () => {
  it('renders a paragraph', () => {
    render(<XDSMarkdown>{'Hello world'}</XDSMarkdown>);
    expect(screen.getByText('Hello world')).toBeTruthy();
  });

  it('renders headings', () => {
    render(<XDSMarkdown>{'# Title'}</XDSMarkdown>);
    const heading = screen.getByRole('heading', {level: 1});
    expect(heading).toBeTruthy();
    expect(heading.textContent).toBe('Title');
  });

  it('renders bold and italic', () => {
    const {container} = render(
      <XDSMarkdown>{'**bold** and *italic*'}</XDSMarkdown>,
    );
    expect(container.querySelector('strong')?.textContent).toBe('bold');
    expect(container.querySelector('em')?.textContent).toBe('italic');
  });

  it('renders links with external target', () => {
    const {container} = render(
      <XDSMarkdown>{'[click](https://example.com)'}</XDSMarkdown>,
    );
    const link = container.querySelector('a');
    expect(link?.getAttribute('href')).toBe('https://example.com');
    expect(link?.getAttribute('target')).toBe('_blank');
  });

  it('renders internal links without target blank', () => {
    const {container} = render(
      <XDSMarkdown>{'[click](/page)'}</XDSMarkdown>,
    );
    const link = container.querySelector('a');
    expect(link?.getAttribute('href')).toBe('/page');
    expect(link?.getAttribute('target')).toBeNull();
  });

  it('renders inline code', () => {
    const {container} = render(
      <XDSMarkdown>{'use `const x = 1` here'}</XDSMarkdown>,
    );
    const code = container.querySelector('code');
    expect(code?.textContent).toBe('const x = 1');
  });

  it('renders code blocks', () => {
    const md = '```js\nconsole.log("hi");\n```';
    const {container} = render(<XDSMarkdown>{md}</XDSMarkdown>);
    expect(container.querySelector('pre')).toBeTruthy();
  });

  it('renders blockquotes', () => {
    const {container} = render(<XDSMarkdown>{'> A quote'}</XDSMarkdown>);
    expect(container.querySelector('blockquote')).toBeTruthy();
  });

  it('renders lists', () => {
    const md = '- item 1\n- item 2';
    const {container} = render(<XDSMarkdown>{md}</XDSMarkdown>);
    expect(container.querySelectorAll('li').length).toBe(2);
  });

  it('renders tables', () => {
    const md = '| A | B |\n|---|---|\n| 1 | 2 |';
    const {container} = render(<XDSMarkdown>{md}</XDSMarkdown>);
    expect(container.querySelector('table')).toBeTruthy();
  });

  it('has role=document on root', () => {
    render(<XDSMarkdown data-testid="md">{'hello'}</XDSMarkdown>);
    expect(screen.getByTestId('md').getAttribute('role')).toBe('document');
  });

  it('clamps heading levels', () => {
    render(<XDSMarkdown maxHeadingLevel={2}>{'### Deep'}</XDSMarkdown>);
    expect(screen.getByRole('heading', {level: 2})).toBeTruthy();
  });

  it('shows streaming cursor', () => {
    const {container} = render(<XDSMarkdown isStreaming>{'hello'}</XDSMarkdown>);
    expect(container.querySelector('[aria-hidden="true"]')).toBeTruthy();
  });

  it('hides cursor when not streaming', () => {
    const {container} = render(<XDSMarkdown>{'hello'}</XDSMarkdown>);
    expect(container.querySelector('[aria-hidden="true"]')).toBeNull();
  });

  it('accepts component overrides', () => {
    function Custom({children}: {children: React.ReactNode}) {
      return <p data-custom="true">{children}</p>;
    }
    const {container} = render(
      <XDSMarkdown components={{p: Custom}}>{'text'}</XDSMarkdown>,
    );
    expect(container.querySelector('[data-custom]')).toBeTruthy();
  });
});
