/**
 * Community page — contribution guidance + live GitHub contributors.
 */

import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSSection} from '@xds/core/Section';
import {XDSGrid} from '@xds/core/Grid';
import {XDSCard} from '@xds/core/Card';
import {XDSLink} from '@xds/core/Link';
import {XDSDivider} from '@xds/core/Divider';
import * as stylex from '@stylexjs/stylex';
import {GITHUB_REPO} from '../../../constants';

const styles = stylex.create({
  avatar: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    objectFit: 'cover' as const,
  },
  contributorCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  badge: {
    fontSize: 12,
    fontWeight: 600,
    backgroundColor: 'var(--color-background-muted)',
    borderRadius: 12,
    paddingInline: 8,
    paddingBlock: 2,
  },
});

interface Contributor {
  login: string;
  avatar_url: string;
  contributions: number;
  html_url: string;
}

async function fetchContributors(): Promise<Contributor[]> {
  try {
    const res = await fetch(
      'https://api.github.com/repos/facebookexperimental/xds/contributors?per_page=50',
      {next: {revalidate: 3600}},
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function CommunityPage() {
  const contributors = await fetchContributors();

  return (
    <XDSSection maxWidth="lg" padding={6}>
      <XDSVStack gap={8}>
        {/* Welcome */}
        <XDSVStack gap={3}>
          <XDSHeading level={1}>Community</XDSHeading>
          <XDSText type="large" color="secondary">
            XDS is built in the open. We welcome contributions of all
            kinds—whether it&apos;s fixing a typo, proposing a new component, or
            improving documentation.
          </XDSText>
        </XDSVStack>

        {/* Links */}
        <XDSVStack gap={3}>
          <XDSHeading level={2}>Get Involved</XDSHeading>
          <XDSGrid columns={{minWidth: 250, repeat: 'fill'}} gap={3}>
            <XDSCard padding={4}>
              <XDSVStack gap={1}>
                <XDSText type="body" weight="bold">
                  Contribution Guide
                </XDSText>
                <XDSText type="supporting" color="secondary">
                  Learn how to set up the repo, write components, and submit
                  pull requests.
                </XDSText>
                <XDSLink
                  label="Read the guide"
                  href={`${GITHUB_REPO}/blob/main/CONTRIBUTING.md`}
                  isExternalLink>
                  Read the guide
                </XDSLink>
              </XDSVStack>
            </XDSCard>
            <XDSCard padding={4}>
              <XDSVStack gap={1}>
                <XDSText type="body" weight="bold">
                  Code of Conduct
                </XDSText>
                <XDSText type="supporting" color="secondary">
                  Our community standards and expectations for respectful
                  collaboration.
                </XDSText>
                <XDSLink
                  label="View code of conduct"
                  href={`${GITHUB_REPO}/blob/main/CODE_OF_CONDUCT.md`}
                  isExternalLink>
                  View code of conduct
                </XDSLink>
              </XDSVStack>
            </XDSCard>
            <XDSCard padding={4}>
              <XDSVStack gap={1}>
                <XDSText type="body" weight="bold">
                  License
                </XDSText>
                <XDSText type="supporting" color="secondary">
                  XDS is released under the MIT License.
                </XDSText>
                <XDSLink
                  label="View license"
                  href={`${GITHUB_REPO}/blob/main/LICENSE`}
                  isExternalLink>
                  View license
                </XDSLink>
              </XDSVStack>
            </XDSCard>
            <XDSCard padding={4}>
              <XDSVStack gap={1}>
                <XDSText type="body" weight="bold">
                  Issues &amp; Discussions
                </XDSText>
                <XDSText type="supporting" color="secondary">
                  Report bugs, request features, or ask questions on GitHub.
                </XDSText>
                <XDSLink
                  label="Open an issue"
                  href={`${GITHUB_REPO}/issues`}
                  isExternalLink>
                  Open an issue
                </XDSLink>
              </XDSVStack>
            </XDSCard>
          </XDSGrid>
        </XDSVStack>

        <XDSDivider />

        {/* Contributors */}
        <XDSVStack gap={3}>
          <XDSVStack gap={1}>
            <XDSHeading level={2}>Contributors</XDSHeading>
            <XDSText type="body" color="secondary">
              Thank you to everyone who has contributed to XDS. Sorted by number
              of contributions.
            </XDSText>
          </XDSVStack>

          {contributors.length > 0 ? (
            <XDSGrid columns={{minWidth: 280, repeat: 'fill'}} gap={3}>
              {contributors.map(c => (
                <XDSLink
                  key={c.login}
                  href={c.html_url}
                  isExternalLink
                  label={c.login}>
                  <div {...stylex.props(styles.contributorCard)}>
                    <img
                      src={c.avatar_url}
                      alt={c.login}
                      {...stylex.props(styles.avatar)}
                    />
                    <XDSVStack gap={0}>
                      <XDSText type="body" weight="semibold">
                        {c.login}
                      </XDSText>
                      <XDSText type="supporting" color="secondary">
                        {c.contributions} contribution
                        {c.contributions !== 1 ? 's' : ''}
                      </XDSText>
                    </XDSVStack>
                  </div>
                </XDSLink>
              ))}
            </XDSGrid>
          ) : (
            <XDSText type="body" color="secondary">
              Unable to load contributors. Check back later or view them on{' '}
              <XDSLink
                label="GitHub"
                href={`${GITHUB_REPO}/graphs/contributors`}
                isExternalLink>
                GitHub
              </XDSLink>
              .
            </XDSText>
          )}
        </XDSVStack>
      </XDSVStack>
    </XDSSection>
  );
}
