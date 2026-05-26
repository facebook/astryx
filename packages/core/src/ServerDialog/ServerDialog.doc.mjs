/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'useXDSServerDialog',
  group: 'Dialog',
  keywords: ["server dialog","rsc","react server components","server function","data fetching","modal","async","suspense","preload","client prop","serialization"],
  props: [
    {name: 'renderDialog', type: '(props: TProps) => Promise<ReactNode>', description: 'An async server function that accepts props and returns dialog content.', required: true},
    {name: 'showDialog', type: '(serverProps, clientProps) => void', description: 'Returned. Calls the server function, renders the dialog inside a Suspense boundary with a loading spinner. Auto-injects onOpenChange.'},
    {name: 'preloadDialog', type: '(serverProps, clientProps) => void', description: 'Returned. Fires the server function early to warm the cache without rendering.'},
    {name: 'dialogElement', type: 'ReactNode', description: 'Returned. The dialog element to render in your JSX tree. Null when no dialog is shown.'},
  ],
  usage: {
    description: 'Bridges the React Server Components serialization boundary for dialogs. Server functions cannot receive callbacks because functions are not serializable — this hook splits props into server props (serializable data) and client props (functions that stay on the client).',
    bestPractices: [
      {guidance: true, description: 'Use ClientProp<T> for any function prop in your server dialog props type. Use the Server wrapper components (XDSDialogServer, XDSButtonServer) inside the server function.'},
      {guidance: true, description: 'Use XDSDialogCloseButton for close/done buttons — it reads onOpenChange from ClientProp context automatically.'},
      {guidance: true, description: 'Call preloadDialog on mouse enter to eliminate loading spinners — the cached result is reused by showDialog.'},
      {guidance: true, description: 'Keep onOpenChange optional in client props — the hook auto-injects one that integrates with dismiss handling. Pass your own only for side effects.'},
      {guidance: false, description: 'Pass function props directly to server functions — they are not serializable and will throw at the RSC boundary.'},
      {guidance: false, description: 'Use XDSDialog or XDSButton directly inside server functions — use the Server variants (XDSDialogServer, XDSButtonServer) which resolve ClientProp markers.'},
    ],
    anatomy: [
      {name: 'Server Function', required: true, description: 'An async function that fetches data and returns dialog content using XDSDialogServer.'},
      {name: 'ClientProp markers', required: true, description: 'Serializable placeholders for function props (onOpenChange, onClick) that are resolved on the client.'},
      {name: 'XDSDialogCloseButton', required: false, description: 'A button that closes the dialog by calling onOpenChange(false) from ClientProp context. No props needed for the close behavior.'},
      {name: 'Loading fallback', required: false, description: 'A Suspense boundary with a spinner dialog shown while the server function resolves.'},
    ],
  },
  examples: [
    {
      label: 'Server action with data fetching',
      code: `
// actions/fetchUserDialog.tsx — 'use server' file
'use server';

import {XDSDialogServer, XDSDialogCloseButton} from '@xds/core/ServerDialog';
import type {ClientProp} from '@xds/core/ServerDialog';
import {XDSDialogHeader} from '@xds/core/Dialog';
import {XDSLayout, XDSLayoutContent, XDSLayoutFooter, XDSHStack, XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

type UserDialogProps = {
  userId: string;
  onOpenChange: ClientProp<(isOpen: boolean) => void>;
};

export async function fetchUserDialog(props: UserDialogProps) {
  const user = await db.users.find(props.userId);

  return (
    <XDSDialogServer isOpen onOpenChange={props.onOpenChange} width={400}>
      <XDSLayout
        header={<XDSDialogHeader title={user.name} />}
        content={
          <XDSLayoutContent>
            <XDSVStack gap={2}>
              <XDSText type="body">{user.email}</XDSText>
            </XDSVStack>
          </XDSLayoutContent>
        }
        footer={
          <XDSLayoutFooter>
            <XDSHStack gap={2} hAlign="end">
              <XDSDialogCloseButton label="Done" variant="primary" />
            </XDSHStack>
          </XDSLayoutFooter>
        }
      />
    </XDSDialogServer>
  );
}
`,
    },
    {
      label: 'Client component with preloading',
      code: `
// components/UserButton.tsx — 'use client' file
'use client';

import {useXDSServerDialog} from '@xds/core/ServerDialog';
import {XDSButton} from '@xds/core/Button';
import {fetchUserDialog} from '../actions/fetchUserDialog';

export function UserButton({userId}: {userId: string}) {
  const [showDialog, preloadDialog, dialogElement] =
    useXDSServerDialog(fetchUserDialog);

  return (
    <>
      <XDSButton
        label="View User"
        onMouseEnter={() => preloadDialog({userId}, {})}
        onClick={() => showDialog({userId}, {})}
      />
      {dialogElement}
    </>
  );
}
`,
    },
  ],
};
