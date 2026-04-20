/**
 * @file BarRegistry.ts
 * @output Context for bar marks to register for grouped positioning
 * @position Created by XDSChart, consumed by XDSChartBar
 *
 * Bars register their dataKey via useLayoutEffect. The registry tracks
 * insertion order so each bar gets a stable index for side-by-side grouping.
 */

import {
  createContext,
  useContext,
  useLayoutEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';

interface BarGroupInfo {
  index: number;
  count: number;
}

const BarActionsContext = createContext<{
  register: (dataKey: string) => void;
  unregister: (dataKey: string) => void;
} | null>(null);

const BarKeysContext = createContext<string[]>([]);

/** Wraps chart children to enable bar grouping registration. */
export function BarRegistryProvider({children}: {children: ReactNode}) {
  const [keys, setKeys] = useState<string[]>([]);
  const keysRef = useRef<string[]>([]);

  const register = useCallback((dataKey: string) => {
    if (keysRef.current.includes(dataKey)) return;
    keysRef.current = [...keysRef.current, dataKey];
    setKeys([...keysRef.current]);
  }, []);

  const unregister = useCallback((dataKey: string) => {
    keysRef.current = keysRef.current.filter(k => k !== dataKey);
    setKeys([...keysRef.current]);
  }, []);

  return (
    <BarActionsContext.Provider value={{register, unregister}}>
      <BarKeysContext.Provider value={keys}>
        {children}
      </BarKeysContext.Provider>
    </BarActionsContext.Provider>
  );
}

/**
 * Register a bar and get its group position.
 * Registers on mount, unregisters on unmount.
 * Returns undefined when stacked or only one bar (no grouping needed).
 */
export function useBarGroup(
  dataKey: string,
  isStacked: boolean,
): BarGroupInfo | undefined {
  const actions = useContext(BarActionsContext);
  const keys = useContext(BarKeysContext);

  useLayoutEffect(() => {
    if (!actions || isStacked) return;
    actions.register(dataKey);
    return () => actions.unregister(dataKey);
  }, [actions, dataKey, isStacked]);

  if (isStacked || keys.length <= 1) return undefined;

  const index = keys.indexOf(dataKey);
  if (index === -1) return undefined;

  return {index, count: keys.length};
}
