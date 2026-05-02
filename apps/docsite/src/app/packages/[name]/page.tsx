import {notFound} from 'next/navigation';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSVStack} from '@xds/core/Layout';
import {XDSSection} from '@xds/core/Section';
import {XDSBadge} from '@xds/core/Badge';
import {packages} from '../../../generated/packageRegistry';

export function generateStaticParams() {
  return packages.map(p => ({name: encodeURIComponent(p.name)}));
}

export default async function PackagePage({
  params,
}: {
  params: Promise<{name: string}>;
}) {
  const {name: encodedName} = await params;
  const pkg = packages.find(p => encodeURIComponent(p.name) === encodedName);
  if (!pkg) notFound();

  return (
    <XDSSection maxWidth="md" padding={6}>
      <XDSVStack gap={4}>
        <XDSVStack gap={2}>
          <XDSHeading level={1}>{pkg.name}</XDSHeading>
          <XDSBadge label={`v${pkg.version}`} variant="info" />
        </XDSVStack>
        <XDSText type="body" color="secondary">
          {pkg.description}
        </XDSText>
      </XDSVStack>
    </XDSSection>
  );
}
