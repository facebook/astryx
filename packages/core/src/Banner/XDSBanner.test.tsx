import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {XDSBanner} from './XDSBanner';

describe('XDSBanner', () => {
  it('renders with title', () => {
    render(<XDSBanner status="info" title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders with description', () => {
    render(
      <XDSBanner
        status="info"
        title="Title"
        description="Test description"
      />,
    );
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('renders info status with role="status"', () => {
    render(<XDSBanner status="info" title="Info" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders success status with role="status"', () => {
    render(<XDSBanner status="success" title="Success" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders warning status with role="alert"', () => {
    render(<XDSBanner status="warning" title="Warning" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders error status with role="alert"', () => {
    render(<XDSBanner status="error" title="Error" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders with custom icon', () => {
    render(
      <XDSBanner
        status="info"
        title="Custom Icon"
        icon={<span data-testid="custom-icon">★</span>}
      />,
    );
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('renders default icon when no custom icon provided', () => {
    const {container} = render(<XDSBanner status="info" title="Default Icon" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders as dismissable and handles dismiss', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(
      <XDSBanner
        status="info"
        title="Dismissable"
        isDismissable
        onDismiss={onDismiss}
      />,
    );

    expect(screen.getByText('Dismissable')).toBeInTheDocument();
    const dismissButton = screen.getByRole('button', {name: 'Dismiss'});
    expect(dismissButton).toBeInTheDocument();

    await user.click(dismissButton);
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Dismissable')).not.toBeInTheDocument();
  });

  it('renders endButton', () => {
    render(
      <XDSBanner
        status="info"
        title="With Action"
        endButton={<button data-testid="action-btn">Action</button>}
      />,
    );
    expect(screen.getByTestId('action-btn')).toBeInTheDocument();
  });

  it('renders card variant by default', () => {
    const {container} = render(<XDSBanner status="info" title="Card" />);
    const banner = container.firstElementChild;
    expect(banner).toBeInTheDocument();
  });

  it('renders section variant', () => {
    const {container} = render(
      <XDSBanner status="info" title="Section" variant="section" />,
    );
    const banner = container.firstElementChild;
    expect(banner).toBeInTheDocument();
  });

  it('renders children', () => {
    render(
      <XDSBanner status="info" title="With Children">
        <span data-testid="child-content">Extra content</span>
      </XDSBanner>,
    );
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('supports data-testid', () => {
    render(
      <XDSBanner status="info" title="Test" data-testid="my-banner" />,
    );
    expect(screen.getByTestId('my-banner')).toBeInTheDocument();
  });

  it('forwards ref', () => {
    const ref = {current: null as HTMLDivElement | null};
    render(<XDSBanner ref={ref} status="info" title="Ref Test" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('renders all four status types', () => {
    const statuses = ['info', 'success', 'warning', 'error'] as const;
    for (const status of statuses) {
      const {unmount} = render(
        <XDSBanner status={status} title={`${status} banner`} />,
      );
      expect(screen.getByText(`${status} banner`)).toBeInTheDocument();
      unmount();
    }
  });
});
