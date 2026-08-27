'use client';

/**
 * SAMPLE AGENT OUTPUT — "adopted" (fixture, not app source).
 *
 * What an adopting run produces for t3-1: the design system's hover layer and
 * badge, the app's canonical status mapping preserved through an explicit
 * tone → variant translation, and a focus path. Used by adoption-eval.test.ts.
 */

import {useState} from 'react';
import {HoverCard} from '@astryxdesign/core/HoverCard';
import {Badge, type BadgeVariant} from '@astryxdesign/core/Badge';
import {Text} from '@astryxdesign/core/Text';
import {fetchTicket, type Ticket} from '@/lib/entities';
import {
  toneForStatus,
  STATUS_LABEL,
  type RunStatus,
  type Tone,
} from '@/lib/status';

/** App tone vocabulary → the design system's badge variants. */
const TONE_VARIANT: Record<Tone, BadgeVariant> = {
  neutral: 'neutral',
  info: 'info',
  progress: 'blue',
  attention: 'warning',
  positive: 'success',
  danger: 'error',
  inert: 'neutral',
};

function TicketSummary({ticket}: {ticket: Ticket}) {
  const status = ticket.state as unknown as RunStatus;
  return (
    <div className="flex w-72 flex-col gap-1">
      <div className="flex items-center justify-between gap-2">
        <Text weight="medium">{ticket.title}</Text>
        <Badge
          variant={TONE_VARIANT[toneForStatus(status)]}
          label={STATUS_LABEL[status]}
        />
      </div>
      <Text color="secondary">{ticket.assignee}</Text>
    </div>
  );
}

export function TicketHovercard({
  ticketId,
  children,
}: {
  ticketId: string;
  children: React.ReactNode;
}) {
  const [ticket, setTicket] = useState<Ticket | null>(null);

  return (
    <HoverCard
      label={`Ticket ${ticketId}`}
      focusTrigger="always"
      placement="above"
      onOpenChange={async open => {
        if (open && !ticket) setTicket(await fetchTicket(ticketId));
      }}
      content={
        ticket ? (
          <TicketSummary ticket={ticket} />
        ) : (
          <Text color="secondary">Loading…</Text>
        )
      }>
      {children}
    </HoverCard>
  );
}
