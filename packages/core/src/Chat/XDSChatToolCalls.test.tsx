import {render, screen, fireEvent} from '@testing-library/react';
import {XDSChatToolCalls} from './XDSChatToolCalls';

describe('XDSChatToolCalls', () => {
  it('renders nothing for empty calls', () => {
    const {container} = render(<XDSChatToolCalls calls={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders single call inline without group chrome', () => {
    render(
      <XDSChatToolCalls
        calls={[{name: 'bash', status: 'complete', duration: '1.2s'}]}
      />,
    );
    expect(screen.getByText('bash')).toBeInTheDocument();
    expect(screen.getByText('1.2s')).toBeInTheDocument();
    // No group header / expand button for single call
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders latest call as surface for multiple calls', () => {
    render(
      <XDSChatToolCalls
        calls={[
          {name: 'searchCode', status: 'complete'},
          {name: 'readFile', status: 'complete'},
          {name: 'editFile', status: 'running'},
        ]}
      />,
    );
    // Latest call (editFile) shown at surface + in expanded list
    expect(screen.getAllByText('editFile').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('hides duration when not complete', () => {
    render(
      <XDSChatToolCalls
        calls={[{name: 'bash', status: 'running', duration: '1.2s'}]}
      />,
    );
    expect(screen.queryByText('1.2s')).not.toBeInTheDocument();
  });

  it('defaults to collapsed', () => {
    render(
      <XDSChatToolCalls
        calls={[
          {name: 'a', status: 'complete'},
          {name: 'b', status: 'complete'},
        ]}
      />,
    );
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('auto-collapses groups of more than 3', () => {
    render(
      <XDSChatToolCalls
        calls={[{name: 'a'}, {name: 'b'}, {name: 'c'}, {name: 'd'}]}
      />,
    );
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('toggles on click', () => {
    render(
      <XDSChatToolCalls
        defaultIsExpanded={false}
        calls={[
          {name: 'a', status: 'complete'},
          {name: 'b', status: 'complete'},
        ]}
      />,
    );
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'true');
  });

  it('shows target when provided', () => {
    render(
      <XDSChatToolCalls
        calls={[{name: 'bash', target: 'git status', status: 'complete'}]}
      />,
    );
    expect(screen.getByText('git status')).toBeInTheDocument();
  });
});
