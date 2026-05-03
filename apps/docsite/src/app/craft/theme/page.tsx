/**
 * Page type: theme editor
 * Live theme customization with token adjustments and preview.
 * All client-side — no AI/inference needed.
 * TODO: port ThemeEditorView from sandbox.
 */

import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSVStack} from '@xds/core/Layout';
import {XDSSection} from '@xds/core/Section';

export default function ThemeEditorPage() {
  return (
    <XDSSection maxWidth="lg" padding={6}>
      <XDSVStack gap={4}>
        <XDSHeading level={1}>Theme Editor</XDSHeading>
        <XDSText type="body" color="secondary">
          Customize colors, typography, radius, and more. Preview changes live.
        </XDSText>
        {/* TODO: port theme editor controls + live preview */}
      </XDSVStack>
    </XDSSection>
  );
}
