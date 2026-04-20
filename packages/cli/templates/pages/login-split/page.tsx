'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSVStack, XDSHStack, XDSStackItem} from '@xds/core/Layout';
import {XDSGrid} from '@xds/core/Grid';
import {XDSCenter} from '@xds/core/Center';
import {XDSCard} from '@xds/core/Card';
import {XDSText} from '@xds/core/Text';
import {XDSIcon} from '@xds/core/Icon';
import {SquaresPlusIcon} from '@heroicons/react/24/outline';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSButton} from '@xds/core/Button';
import {XDSLink} from '@xds/core/Link';
import {XDSDivider} from '@xds/core/Divider';
import {
  colorVars,
  spacingVars,
  radiusVars,
} from '@xds/core/theme/tokens.stylex';

const COVER_IMAGE_URL = '/templates/light-working-vertical-1.png';

const APPLE_ICON_URL = '/templates/apple-logo.png';
const GOOGLE_ICON_URL = '/templates/google-logo.png';

const styles = stylex.create({
  page: {
    backgroundColor: colorVars['--color-background-body'],
  },
  fullWidth: {
    width: '100%',
  },
  formColumn: {
    padding: spacingVars['--spacing-8'],
  },
  imageColumn: {
    paddingBlock: spacingVars['--spacing-4'],
    paddingInlineEnd: spacingVars['--spacing-4'],
  },
  coverImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    borderRadius: radiusVars['--radius-container'],
  },
});

export default function LoginTwoColumn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginFailed, setLoginFailed] = useState(false);

  return (
    <XDSCenter axis="both" height="100dvh" xstyle={styles.page}>
      <XDSVStack gap={4} hAlign="center">
        {/* Card */}
        <XDSCard padding={0} maxWidth={1000} width="100%">
          <XDSGrid columns={2} align="stretch">
            {/* Left — Form */}
            <XDSVStack xstyle={styles.formColumn}>
              <XDSHStack gap={2} vAlign="center">
                <XDSIcon icon={SquaresPlusIcon} />
                <XDSText type="body" weight="bold">Product Inc.</XDSText>
              </XDSHStack>

              <XDSStackItem size="fill">
                <XDSCenter axis="vertical" height="100%">
                  <XDSVStack gap={4} xstyle={styles.fullWidth}>
                    <XDSVStack gap={1}>
                      <XDSText type="display-1" as="h2">Welcome back</XDSText>
                      <XDSText type="body" color="secondary" size="sm">
                        Login to your Product Inc. account
                      </XDSText>
                    </XDSVStack>

                    <XDSVStack gap={2}>
                      <XDSTextInput
                        label="Email"
                        isLabelHidden
                        type="email"
                        placeholder="name@company.com"
                        value={email}
                        onChange={setEmail}
                        size="lg"
                      />
                      <XDSVStack gap={1}>
                        <XDSTextInput
                          label="Password"
                          isLabelHidden
                          placeholder="Enter your password"
                          type="password"
                          value={password}
                          onChange={(v: string) => {
                            setPassword(v);
                            setLoginFailed(false);
                          }}
                          size="lg"
                          status={
                            loginFailed
                              ? {
                                  type: 'error',
                                  message: 'Incorrect password. Try again.',
                                }
                              : undefined
                          }
                        />
                        {loginFailed && (
                          <XDSVStack hAlign="end">
                            <XDSLink
                              label="Forgot your password?"
                              href="#"
                              size="sm"
                              color="secondary"
                              type="supporting">
                              Forgot your password?
                            </XDSLink>
                          </XDSVStack>
                        )}
                      </XDSVStack>
                    </XDSVStack>

                    <XDSButton
                      label="Login"
                      variant="primary"
                      size="lg"
                      xstyle={styles.fullWidth}
                      onClick={() => setLoginFailed(true)}
                    />

                    <XDSDivider label="Or continue with" />

                    <XDSHStack gap={3}>
                      <XDSStackItem size="fill">
                        <XDSButton
                          label="Apple"
                          variant="secondary"
                          icon={<img src={APPLE_ICON_URL} width={16} height={16} alt="" />}
                          size="lg"
                          xstyle={styles.fullWidth}
                        />
                      </XDSStackItem>
                      <XDSStackItem size="fill">
                        <XDSButton
                          label="Google"
                          variant="secondary"
                          icon={<img src={GOOGLE_ICON_URL} width={16} height={16} alt="" />}
                          size="lg"
                          xstyle={styles.fullWidth}
                        />
                      </XDSStackItem>
                    </XDSHStack>
                  </XDSVStack>
                </XDSCenter>
              </XDSStackItem>

              <XDSText type="supporting" color="secondary">
                Don&apos;t have an account?{' '}
                <XDSLink label="Sign up" href="#" type="supporting">
                  Sign up
                </XDSLink>
              </XDSText>
            </XDSVStack>

            {/* Right — Cover image */}
            <XDSVStack xstyle={styles.imageColumn}>
              <img
                {...stylex.props(styles.coverImage)}
                src={COVER_IMAGE_URL}
                alt="Two people working at a desk"
              />
            </XDSVStack>
          </XDSGrid>
        </XDSCard>

        {/* Terms */}
        <XDSVStack hAlign="center">
          <XDSText type="supporting" color="secondary">
            By clicking continue, you agree to our{' '}
            <XDSLink label="Terms of Service" href="#" type="supporting">
              Terms of Service
            </XDSLink>{' '}
            and{' '}
            <XDSLink label="Privacy Policy" href="#" type="supporting">
              Privacy Policy
            </XDSLink>
            .
          </XDSText>
        </XDSVStack>
      </XDSVStack>
    </XDSCenter>
  );
}
