import {Layout, LayoutHeader, LayoutContent} from '@astryxdesign/core/Layout';
import {AppShell} from '@astryxdesign/core/AppShell';
import {TopNav} from '@astryxdesign/core/TopNav';
import {Text} from '@astryxdesign/core/Text';
import '@astryxdesign/theme-neutral/theme.css';

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <AppShell>
      <Layout height="fill">
        <LayoutHeader>
          <TopNav>
            <Text type="label" weight="bold">Internal Tool</Text>
          </TopNav>
        </LayoutHeader>
        <LayoutContent>
          <div className="p-6">
            {children}
          </div>
        </LayoutContent>
      </Layout>
    </AppShell>
  );
}
