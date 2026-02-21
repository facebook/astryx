/**
 * @file XDSAccordionContext.tsx
 * @input Uses React createContext
 * @output Exports AccordionContext and AccordionContextValue type
 * @position Context definition for accordion coordination
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Accordion/XDSAccordion.tsx (provider)
 * - /packages/core/src/Accordion/README.md
 */

import {createContext} from 'react';

/**
 * Context value provided by XDSAccordion to coordinate collapsible children.
 */
export interface AccordionContextValue {
  /** Check if a given value is currently open. */
  isOpen: (value: string) => boolean;
  /** Toggle the open state of a given value. */
  toggle: (value: string) => void;
}

/**
 * Context for accordion coordination.
 * When present, collapsible components defer their open/close state to the accordion.
 */
export const AccordionContext = createContext<AccordionContextValue | null>(
  null,
);
