// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {SVGIcon} from './SVGIcon';
import {bellIcon} from './icons';

describe('SVGIcon', () => {
  it('defaults to decorative (aria-hidden) when no accessible name is given', () => {
    const {container} = render(<SVGIcon icon={bellIcon} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).not.toHaveAttribute('role');
  });

  it('respects a consumer aria-label: role="img" and no aria-hidden', () => {
    render(<SVGIcon icon={bellIcon} aria-label="Notifications" />);
    const svg = screen.getByRole('img', {name: 'Notifications'});
    expect(svg).not.toHaveAttribute('aria-hidden');
  });

  it('respects a consumer aria-labelledby: role="img" and no aria-hidden', () => {
    render(
      <>
        <span id="svg-icon-lbl">Alerts</span>
        <SVGIcon icon={bellIcon} aria-labelledby="svg-icon-lbl" />
      </>,
    );
    const svg = screen.getByRole('img', {name: 'Alerts'});
    expect(svg).not.toHaveAttribute('aria-hidden');
  });

  it('still lets an explicit aria-hidden from the consumer win', () => {
    const {container} = render(
      <SVGIcon icon={bellIcon} aria-label="Notifications" aria-hidden="true" />,
    );
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });
});
