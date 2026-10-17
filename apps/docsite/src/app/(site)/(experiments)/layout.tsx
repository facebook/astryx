// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Keeps the direct-route homepage experiments out of crawler discovery while
 * preserving the same site shell and inherited homepage metadata.
 */

import type {Metadata} from 'next';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function ExperimentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
