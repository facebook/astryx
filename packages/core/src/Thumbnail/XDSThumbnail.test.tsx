import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {XDSThumbnail} from './XDSThumbnail';

describe('XDSThumbnail', () => {
  it('renders an image when src is provided', () => {
    render(<XDSThumbnail src="/photo.jpg" alt="Test photo" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/photo.jpg');
    expect(img).toHaveAttribute('alt', 'Test photo');
  });

  it('renders placeholder when no src is provided', () => {
    render(<XDSThumbnail data-testid="thumb" />);
    const root = screen.getByTestId('thumb');
    expect(root.querySelector('svg')).toBeInTheDocument();
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('shows skeleton when isLoading with no src', () => {
    const {container} = render(
      <XDSThumbnail isLoading data-testid="thumb" />,
    );
    expect(container.querySelector('.xds-skeleton')).toBeInTheDocument();
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('shows image with upload overlay when isLoading with src', () => {
    render(
      <XDSThumbnail src="/local.jpg" alt="Uploading" isLoading data-testid="thumb" />,
    );
    // Image is visible (local preview)
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/local.jpg');
    // Spinner overlay is present
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders the label', () => {
    render(<XDSThumbnail label="report.pdf" />);
    expect(screen.getByText('report.pdf')).toBeInTheDocument();
  });

  it('renders the caption', () => {
    render(<XDSThumbnail caption="2.4 MB" />);
    expect(screen.getByText('2.4 MB')).toBeInTheDocument();
  });

  it('calls onRemove when remove button is clicked', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(<XDSThumbnail label="file.png" onRemove={onRemove} />);
    const removeBtn = screen.getByRole('button', {name: 'Remove file.png'});
    await user.click(removeBtn);
    expect(onRemove).toHaveBeenCalledOnce();
  });

  it('calls onClick when thumbnail is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<XDSThumbnail src="/img.jpg" alt="Clickable" onClick={onClick} />);
    const btn = screen.getByRole('button', {name: 'Clickable'});
    await user.click(btn);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not render remove button when disabled', () => {
    const onRemove = vi.fn();
    render(<XDSThumbnail label="file.png" onRemove={onRemove} isDisabled />);
    expect(screen.queryByRole('button', {name: /Remove/})).toBeNull();
  });

  it('does not render onClick button when disabled', () => {
    const onClick = vi.fn();
    render(
      <XDSThumbnail src="/img.jpg" alt="Test" onClick={onClick} isDisabled />,
    );
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('is not interactive when isLoading', () => {
    const onClick = vi.fn();
    render(
      <XDSThumbnail src="/img.jpg" alt="Test" onClick={onClick} isLoading />,
    );
    // No interactive button — just the spinner overlay
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('forwards ref to root element', () => {
    const ref = vi.fn();
    render(<XDSThumbnail ref={ref} data-testid="thumb" />);
    expect(ref).toHaveBeenCalled();
  });
});
