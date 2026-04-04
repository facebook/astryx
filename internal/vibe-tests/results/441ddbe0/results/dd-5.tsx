import {useState} from 'react';
import {XDSTable, useXDSTableSelection, useXDSTableSelectionState} from '@xds/core/Table';
import type {XDSTableColumn} from '@xds/core/Table';
import {XDSText} from '@xds/core/Text';
import {XDSVStack, XDSHStack, XDSStackItem} from '@xds/core/Stack';
import {XDSButton} from '@xds/core/Button';
import {XDSDropdownMenu} from '@xds/core/DropdownMenu';
import {XDSBadge} from '@xds/core/Badge';

type Email = {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  date: string;
  isRead: boolean;
};

const emails: Email[] = [
  {
    id: '1',
    sender: 'Alice Johnson',
    subject: 'Q2 Planning Meeting Notes',
    preview: 'Hey team, here are the notes from our planning session yesterday. Please review the action items...',
    date: '2026-04-04',
    isRead: false,
  },
  {
    id: '2',
    sender: 'Bob Smith',
    subject: 'Re: Design System Update',
    preview: 'Looks great! I left some comments on the PR. The new token structure is much cleaner...',
    date: '2026-04-03',
    isRead: true,
  },
  {
    id: '3',
    sender: 'Carol Williams',
    subject: 'Urgent: Production Incident',
      preview: "We're seeing elevated error rates on the checkout flow. The SEV has been filed and oncall is...",
    date: '2026-04-03',
    isRead: false,
  },
  {
    id: '4',
    sender: 'David Chen',
    subject: 'Weekly Standup Recap',
      preview: "Here's a summary of what everyone shared in standup this week. Key highlights include the...",
    date: '2026-04-02',
    isRead: true,
  },
  {
    id: '5',
    sender: 'Eva Martinez',
    subject: 'New Component Proposal: DataGrid',
      preview: "I've drafted a proposal for a new DataGrid component. It builds on XDSTable but adds inline...",
    date: '2026-04-02',
    isRead: true,
  },
  {
    id: '6',
    sender: 'Frank Lee',
    subject: 'Offsite Logistics',
    preview: 'Please fill out the travel form by Friday. Hotel blocks have been reserved at the Marriott...',
    date: '2026-04-01',
    isRead: false,
  },
  {
    id: '7',
    sender: 'Grace Kim',
    subject: 'Re: API Review Feedback',
    preview: 'Thanks for the thorough review! I addressed all the comments and pushed a new revision...',
    date: '2026-04-01',
    isRead: true,
  },
  {
    id: '8',
    sender: 'Henry Park',
    subject: 'Accessibility Audit Results',
      preview: "The audit found 3 critical issues and 12 minor ones. I've created tasks for each and assigned...",
    date: '2026-03-31',
    isRead: true,
  },
];

export default function EmailInbox() {
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  const {selectionConfig} = useXDSTableSelectionState<Email>({
    data: emails,
    idKey: 'id',
    selectedKeys,
    setSelectedKeys,
  });
  const selectionPlugin = useXDSTableSelection<Email>(selectionConfig);

  const selectedCount = selectedKeys.size;

  const handleArchive = () => {
    setSelectedKeys(new Set());
  };

  const handleMarkRead = () => {
    setSelectedKeys(new Set());
  };

  const handleDelete = () => {
    setSelectedKeys(new Set());
  };

  const columns: XDSTableColumn<Email>[] = [
    {
      key: 'sender',
      header: 'Sender',
      renderCell: (email) => (
        <XDSText type="body" weight={email.isRead ? 'normal' : 'semibold'}>
          {email.sender}
        </XDSText>
      ),
    },
    {
      key: 'subject',
      header: 'Subject',
      renderCell: (email) => (
        <XDSHStack gap={2} vAlign="center">
          <XDSText type="body" weight={email.isRead ? 'normal' : 'semibold'}>
            {email.subject}
          </XDSText>
          {!email.isRead && <XDSBadge variant="info" label="New" />}
        </XDSHStack>
      ),
    },
    {
      key: 'preview',
      header: 'Preview',
      renderCell: (email) => (
        <XDSText type="supporting" color="secondary" maxLines={1}>
          {email.preview}
        </XDSText>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      renderCell: (email) => (
        <XDSText type="supporting" color="secondary">
          {email.date}
        </XDSText>
      ),
    },
  ];

  return (
    <XDSVStack gap={4}>
      <XDSHStack gap={3} vAlign="center">
        <XDSStackItem size="fill">
          <XDSText type="large" weight="bold">
            Inbox
          </XDSText>
        </XDSStackItem>
      </XDSHStack>

      {selectedCount > 0 && (
        <XDSHStack gap={2} vAlign="center">
          <XDSText type="body" weight="semibold">
            {selectedCount} selected
          </XDSText>
          <XDSButton
            label="Archive"
            variant="secondary"
            size="sm"
            onClick={handleArchive}
          />
          <XDSButton
            label="Mark as read"
            variant="secondary"
            size="sm"
            onClick={handleMarkRead}
          />
          <XDSDropdownMenu
            button={{label: 'More actions', variant: 'ghost', size: 'sm'}}
            items={[
              {label: 'Mark as unread', onClick: handleMarkRead},
              {label: 'Move to folder', onClick: () => {}},
              {type: 'divider' as const},
              {label: 'Delete', onClick: handleDelete},
            ]}
          />
        </XDSHStack>
      )}

      <XDSTable<Email>
        data={emails}
        columns={columns}
        idKey="id"
        density="balanced"
        dividers="rows"
        hasHover
        plugins={{selection: selectionPlugin}}
      />
    </XDSVStack>
  );
}
