/**
 * @file XDSChartBarGroup.tsx
 * @output Groups bar children for side-by-side positioning within each band
 * @position Child of XDSChart; parent of XDSChartBar children
 *
 * Counts its XDSChartBar children and provides each with an index
 * and count so they can subdivide the band width evenly.
 */

import {createContext, useContext, Children, type ReactNode} from 'react';

interface BarGroupInfo {
  index: number;
  count: number;
}

const BarGroupContext = createContext<BarGroupInfo | undefined>(undefined);

/** Read bar group info. Returns undefined when not inside a BarGroup. */
export function useBarGroupInfo(): BarGroupInfo | undefined {
  return useContext(BarGroupContext);
}

export interface XDSChartBarGroupProps {
  children: ReactNode;
}

/**
 * Group bars for side-by-side layout. Wrap multiple XDSChartBar
 * children — each gets an equal subdivision of the band width.
 *
 * @example
 * ```
 * <XDSChartBarGroup>
 *   <XDSChartBar dataKey="q1" color="blue" />
 *   <XDSChartBar dataKey="q2" color="green" />
 *   <XDSChartBar dataKey="q3" color="orange" />
 * </XDSChartBarGroup>
 * ```
 */
export function XDSChartBarGroup({children}: XDSChartBarGroupProps) {
  const count = Children.count(children);
  const indexed = Children.map(children, (child, index) => (
    <BarGroupContext.Provider value={{index, count}}>
      {child}
    </BarGroupContext.Provider>
  ));

  return <g>{indexed}</g>;
}
