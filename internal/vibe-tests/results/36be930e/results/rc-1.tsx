import {useState} from 'react';
import {Button} from '@astryxdesign/core/Button';
import {HStack} from '@astryxdesign/core/HStack';
import {VStack} from '@astryxdesign/core/VStack';
import {Text} from '@astryxdesign/core/Text';
import {IconButton} from '@astryxdesign/core/IconButton';
import stylex from '@stylexjs/stylex';

const styles = stylex.create({
  nav: {
    padding: 16,
    borderBottom: '1px solid #e0e0e0',
  },
  mobileMenu: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    zIndex: 1000,
    padding: 24,
  },
  desktopLinks: {
    display: 'flex',
    gap: 8,
    '@media (max-width: 768px)': {
      display: 'none',
    },
  },
  hamburger: {
    display: 'none',
    '@media (max-width: 768px)': {
      display: 'flex',
    },
  },
  logo: {
    fontWeight: 700,
    fontSize: 20,
  },
});

const navLinks = ['Home', 'Products', 'About', 'Contact', 'Blog'];

export default function ResponsiveNav() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      <nav {...stylex.props(styles.nav)}>
        <HStack hAlign="between" vAlign="center">
          <Text type="label" {...stylex.props(styles.logo)}>
            MyApp
          </Text>
          <div {...stylex.props(styles.desktopLinks)}>
            <HStack gap={1}>
              {navLinks.map(link => (
                <Button key={link} label={link} variant="ghost" size="sm" />
              ))}
            </HStack>
          </div>
          <div {...stylex.props(styles.hamburger)}>
            <IconButton
              label="Open menu"
              icon={<span>&#9776;</span>}
              variant="ghost"
              onClick={() => setIsMobileOpen(true)}
            />
          </div>
        </HStack>
      </nav>
      {isMobileOpen && (
        <div {...stylex.props(styles.mobileMenu)}>
          <VStack gap={3}>
            <HStack hAlign="between" vAlign="center">
              <Text type="label" {...stylex.props(styles.logo)}>
                MyApp
              </Text>
              <IconButton
                label="Close menu"
                icon={<span>&times;</span>}
                variant="ghost"
                onClick={() => setIsMobileOpen(false)}
              />
            </HStack>
            {navLinks.map(link => (
              <Button
                key={link}
                label={link}
                variant="ghost"
                onClick={() => setIsMobileOpen(false)}
              />
            ))}
          </VStack>
        </div>
      )}
    </>
  );
}
