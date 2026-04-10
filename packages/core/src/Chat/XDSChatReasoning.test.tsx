import {render, screen, fireEvent} from '@testing-library/react';
import {XDSChatReasoning} from './XDSChatReasoning';

describe('XDSChatReasoning', () => {
  it('renders collapsed by default', () => {
    render(<XDSChatReasoning>Some reasoning text</XDSChatReasoning>);
    expect(screen.getByText('Thinking')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('shows preview text when collapsed', () => {
    render(
      <XDSChatReasoning>
        Some reasoning text about constraints
      </XDSChatReasoning>,
    );
    expect(
      screen.getAllByText('Some reasoning text about constraints').length,
    ).toBeGreaterThanOrEqual(1);
  });

  it('expands on click', () => {
    render(<XDSChatReasoning>Reasoning content here</XDSChatReasoning>);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('shows duration when not streaming', () => {
    render(<XDSChatReasoning duration="12s">Text</XDSChatReasoning>);
    expect(screen.getByText('12s')).toBeInTheDocument();
  });

  it('hides duration when streaming', () => {
    render(
      <XDSChatReasoning duration="12s" isStreaming>
        Text
      </XDSChatReasoning>,
    );
    expect(screen.queryByText('12s')).not.toBeInTheDocument();
  });

  it('supports custom label', () => {
    render(<XDSChatReasoning label="Processing">Text</XDSChatReasoning>);
    expect(screen.getByText('Processing')).toBeInTheDocument();
  });

  it('supports defaultIsExpanded', () => {
    render(<XDSChatReasoning defaultIsExpanded>Content</XDSChatReasoning>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
  });
});
