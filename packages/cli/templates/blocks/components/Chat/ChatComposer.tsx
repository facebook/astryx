'use client';

import {useState} from 'react';
import {
  XDSChatComposer,
  XDSChatComposerDrawer,
  XDSChatComposerInput,
} from '@xds/core/Chat';
import {XDSButton} from '@xds/core/Button';
import {XDSToken} from '@xds/core/Token';
import {XDSIcon} from '@xds/core/Icon';
import {XDSDropdownMenu} from '@xds/core/DropdownMenu';
import {XDSStack} from '@xds/core/Layout';
import {XDSProgressBar} from '@xds/core/ProgressBar';
import {
  AtSymbolIcon,
  CodeBracketIcon,
  ListBulletIcon,
  PaperClipIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

const MODES = [
  {label: 'Auto', icon: SparklesIcon},
  {label: 'Code', icon: CodeBracketIcon},
  {label: 'Plan', icon: ListBulletIcon},
];

export default function ChatComposer() {
  const [mode, setMode] = useState(MODES[0]);
  return (
    <XDSStack direction="vertical" gap={4} width={450}>
        <XDSChatComposer
          onSubmit={() => {}}
          input={<XDSChatComposerInput style={{minHeight: 66}} />}
          drawer={
            <XDSChatComposerDrawer count={2}>
              <XDSToken label="report.pdf" onRemove={() => {}} />
              <XDSToken label="data.csv" onRemove={() => {}} />
            </XDSChatComposerDrawer>
          }
          headerContext={
            <XDSProgressBar label="Context window" value={42} isLabelHidden />
          }
          headerActions={
            <>
              <XDSButton
                label="Mention"
                variant="ghost"
                size="sm"
                icon={<XDSIcon icon={AtSymbolIcon} size="sm" />}
                isIconOnly
                onClick={() => {}}
              />
              <XDSButton
                label="Attach"
                variant="ghost"
                size="sm"
                icon={<XDSIcon icon={PaperClipIcon} size="sm" />}
                isIconOnly
                onClick={() => {}}
              />
            </>
          }
          footerActions={
            <>
              <XDSDropdownMenu
                button={{
                  label: mode.label,
                  variant: 'ghost',
                  size: 'md',
                  icon: <XDSIcon icon={mode.icon} size="sm" />,
                }}
                menuWidth={120}
                items={MODES.map((m) => ({
                  label: m.label,
                  icon: m.icon,
                  onClick: () => setMode(m),
                }))}
              />
              <XDSDropdownMenu
                button={{label: 'Settings', variant: 'ghost', size: 'md'}}
                menuWidth={180}
                items={[
                  {label: 'Personalization', onClick: () => {}},
                  {label: 'Memory & history', onClick: () => {}},
                  {label: 'Data controls', onClick: () => {}},
                ]}
              />
            </>
          }
        />
    </XDSStack>
  );
}
