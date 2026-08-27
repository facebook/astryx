'use client';

/**
 * SAMPLE AGENT OUTPUT — "hand-rolled" (fixture, not app source).
 *
 * What a non-adopting run produces for t3-1: copies the precedent in the tree,
 * hover-only, its own colour mapping, its own overlay. Used by
 * adoption-eval.test.ts to prove the checks fire.
 */

import {useState} from 'react';
import {cn} from '@/lib/utils';
import {fetchTicket, type Ticket} from '@/lib/entities';

const TICKET_TONE: Record<string, string> = {
  queued: 'neutral',
  running: 'info',
  needs_review: 'info',
  blocked: 'warning',
  succeeded: 'success',
  failed: 'error',
  abandoned: 'neutral',
};

const TONE_STYLE: Record<string, string> = {
  neutral: 'bg-[#1c1c21] text-[#9a9aa4]',
  info: 'bg-[#0ea5e926] text-[#7dd3fc]',
  warning: 'bg-[#f59e0b26] text-[#fcd34d]',
  success: 'bg-[#10b98126] text-[#6ee7b7]',
  error: 'bg-[#ef444426] text-[#fca5a5]',
};

export function TicketHovercard({
  ticketId,
  children,
}: {
  ticketId: string;
  children: React.ReactNode;
}) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <span
      className="relative inline-block"
      onMouseEnter={async () => {
        setOpen(true);
        if (!ticket) setTicket(await fetchTicket(ticketId));
      }}
      onMouseLeave={() => setOpen(false)}>
      <span className="cursor-default underline decoration-dotted">
        {children}
      </span>
      {open && ticket ? (
        <span
          style={{zIndex: 9999}}
          className={cn(
            'absolute left-0 top-5 -m-1 block w-[280px] rounded-md border p-2.5',
            'border-[#26262c] bg-[#141417] text-[11px] shadow-lg',
          )}>
          <span className="block font-medium">{ticket.title}</span>
          <span className="mt-1 flex items-center gap-1.5">
            <span
              className={cn(
                'inline-flex h-5 items-center rounded-md px-1.5',
                TONE_STYLE[TICKET_TONE[ticket.state] ?? 'neutral'],
              )}>
              {ticket.state}
            </span>
            <span className="text-[#9a9aa4]">{ticket.assignee}</span>
          </span>
        </span>
      ) : null}
    </span>
  );
}
