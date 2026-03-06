import * as stylex from '@stylexjs/stylex';
import {XDSDialog} from '@xds/core/Dialog';
import {XDSVStack} from '@xds/core/Stack';
import {XDSText} from '@xds/core/Text';
import {XDSHeading} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';
import {spacingVars, colorVars} from '@xds/core/theme/tokens.stylex';

const styles = stylex.create({
  header: {
    padding: spacingVars['--spacing-4'],
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  content: {
    padding: spacingVars['--spacing-4'],
    paddingBlockStart: 0,
  },
  codeBlock: {
    fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
    fontSize: '13px',
    lineHeight: '1.5',
    backgroundColor: colorVars['--color-wash'],
    borderRadius: '6px',
    padding: spacingVars['--spacing-3'],
    overflow: 'auto',
    maxHeight: '70vh',
    whiteSpace: 'pre',
    tabSize: 2,
  },
});

interface CodeModalProps {
  isOpen: boolean;
  onHide: () => void;
  promptId: string;
  target: 'xds' | 'baseline' | 'html';
  code: string;
}

export function CodeModal({
  isOpen,
  onHide,
  promptId,
  target,
  code,
}: CodeModalProps) {
  const targetLabel =
    target === 'xds' ? 'XDS' : target === 'baseline' ? 'Baseline' : 'HTML';
  const lineCount = code.split('\n').length;

  return (
    <XDSDialog
      isOpen={isOpen}
      onHide={onHide}
      purpose="info"
      width={800}
      aria-label={`${targetLabel} code for ${promptId}`}>
      <div {...stylex.props(styles.header)}>
        <XDSVStack gap="space1">
          <XDSHeading level={3}>
            {promptId} — {targetLabel}
          </XDSHeading>
          <XDSText type="supporting">{lineCount} lines</XDSText>
        </XDSVStack>
        <XDSButton
          variant="ghost"
          label="Close"
          tooltip="Close"
          icon={<XDSIcon icon="close" color="inherit" />}
          onClick={onHide}
        />
      </div>
      <div {...stylex.props(styles.content)}>
        <div {...stylex.props(styles.codeBlock)}>{code}</div>
      </div>
    </XDSDialog>
  );
}
