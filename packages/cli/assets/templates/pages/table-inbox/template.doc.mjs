// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').TemplateDoc} */
export const doc = {
  type: 'page',
  name: 'Inbox Table',
  displayName: 'Inbox Table',
  description:
    'Divider-free triage queue under a category tab rail badged with unread counts, where hovering a row swaps its timestamp for archive and delete, and clicking it opens the thread in a resizable reading pane that takes the majority of the page — subject and the archive, move and delete controls in the pane header, every message a collapsible headed by name, address and a right-aligned date with the newest one pre-expanded, Reply and Reply all under the last message that open the composer already addressed — Reply all gathering everyone in the thread but the answering team itself — message bodies indented to start under the sender name, image attachments as thumbnails that open a zoomable lightbox gallery, and a non-modal bottom-sheet composer that hugs its own height and leaves the list live while you write. The composer is placeholder-only with Cc and Bcc added on demand. Opens with the top thread already selected and the list at a fixed width. Unread is a status dot on the content line, tags collapse to a count, an attachment clip sits ahead of every timestamp, and a bulk-action bar appears above the tabs once something is selected. As the table narrows the rows stack sender over subject, keep the date on the right and drop the checkbox; narrower still, the pane takes the whole surface. Inbox, mail, email, messages, conversations, thread, triage, queue, category tabs, unread badge, reading pane, split pane, resizable, compose, bottom sheet, cc, bcc, row actions, hover actions, attachments, lightbox, image gallery, notifications, or bulk actions.',
  isReady: true,
  category: 'Table - Split Pane',
};
