import {render, screen, fireEvent} from '@testing-library/react';
import {XDSChatToolCall} from './XDSChatToolCall';

describe('XDSChatToolCall', () => {
  it('renders tool name', () => {
    render(<XDSChatToolCall name="searchCode" />);
    expect(screen.getByText('searchCode')).toBeInTheDocument();
  });

  it('shows duration when complete', () => {
    render(<XDSChatToolCall name="bash" status="complete" duration="1.2s" />);
    expect(screen.getByText('1.2s')).toBeInTheDocument();
  });

  it('hides duration when not complete', () => {
    render(<XDSChatToolCall name="bash" status="running" duration="1.2s" />);
    expect(screen.queryByText('1.2s')).not.toBeInTheDocument();
  });

  it('is not expandable without children', () => {
    render(<XDSChatToolCall name="bash" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('is expandable with children', () => {
    render(
      <XDSChatToolCall name="bash">
        <div>Result content</div>
      </XDSChatToolCall>,
    );
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('expands on click', () => {
    render(
      <XDSChatToolCall name="bash">
        <div>Result content</div>
      </XDSChatToolCall>,
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });
});
