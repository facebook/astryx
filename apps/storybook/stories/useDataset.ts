// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState, useEffect} from 'react';
import {loadDataset} from './datasets';

/** Hook to load a vega dataset. Returns [data, loading]. */
export function useDataset<T = Record<string, unknown>>(
  name: string,
): [T[], boolean] {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    loadDataset<T>(name).then(d => {
      setData(d);
      setLoading(false);
    });
  }, [name]);

  return [data, loading];
}
