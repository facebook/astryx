'use client';

import {XDSAppShell} from '@xds/core/AppShell';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSCenter} from '@xds/core/Center';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSAspectRatio} from '@xds/core/AspectRatio';
import {XDSGrid} from '@xds/core/Grid';
import {XDSDivider} from '@xds/core/Divider';
import * as stylex from '@stylexjs/stylex';

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = stylex.create({
  pageContainer: {
    maxWidth: 1400,
    width: '100%',
    padding: 'var(--spacing-6)',
  },
  splitLayout: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.5fr',
    gap: 'var(--spacing-7)',
    alignItems: 'center',
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
    },
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: 'var(--radius-element)',
  },
});

// ─── Image Data ─────────────────────────────────────────────────────────────
// From the xds_oss asset set (colorful home + lifestyle collection)
// Source: meta assets.file list -s xds_oss -g <name>

const IMAGES = [
  // colorful-lifestyle-vertical-3
  {
    src: 'https://scontent.xx.fbcdn.net/v/t39.6806-6/670881450_942909805294726_1535530701838151731_n.png?_nc_cat=105&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=YJsHuTz01dYQ7kNvwH6-kmk&_nc_oc=AdrX4ZFOAAOKovmtgkhq8ZOE7TIvX385TGpGTWKv-CBDeCxCtDtBYu2n5TgAGwsQFQB_Zq-8wwfWxfD1W20QUMiB&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=kVgWieeU08fPHYu03xp3qw&_nc_ss=7a30f&oh=00_Af1kVcw3_nVnm4owz_4XjpVcktRykLY_t-UZQYywrmhicg&oe=69E85D78',
    alt: 'Colorful lifestyle scene',
  },
  // colorful-lifestyle-horizontal-1
  {
    src: 'https://scontent.xx.fbcdn.net/v/t39.6806-6/670869277_2384531585379073_4187196261303804271_n.png?_nc_cat=109&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=k42Doxes-E8Q7kNvwG33lt4&_nc_oc=AdpmqdVjRRCmHVxDdN_SPhuWz5nvIYHOYS65etg6PHNLb0ZV7F07x5O7Hadq3hY_TPEXy5eG-yMEqC9WG-eerO6S&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=ldgh1BZQykdDzsO6sCfMIQ&_nc_ss=7a30f&oh=00_Af0w9Mf6fn-BBKbzZhOb27o1AeL8PR935dTd8VmeHSUtFw&oe=69E8642F',
    alt: 'Colorful lifestyle horizontal',
  },
  // colorful-lifestyle-vertical-1
  {
    src: 'https://scontent.xx.fbcdn.net/v/t39.6806-6/670480937_2502078110200666_6842204180822201520_n.png?_nc_cat=100&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=CkjsPqmDibQQ7kNvwGqbpNN&_nc_oc=Adp5jI8z5m0aqhA07RtwoFUrqqr3jc6tQshxd5Hr5UyL_DIkFt0wEIQwLeKgXOg1lTBG_Ncth9lSFM0vmPqMxbfx&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=eCyOnLSq2cMADZiwJgLJaQ&_nc_ss=7a30f&oh=00_Af2sEmvEqZa5nd1SqocypZQnRh_FLwZHEBOrG0LTR7tfdA&oe=69E852F4',
    alt: 'Colorful lifestyle vertical',
  },
  // colorful-home-vertical-2
  {
    src: 'https://scontent.xx.fbcdn.net/v/t39.6806-6/673560863_934276929587784_5026365305745738433_n.png?_nc_cat=109&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=pCmzN4XK86oQ7kNvwEs-6bx&_nc_oc=AdpaH9teEZJ98sMGLD1D-80kGCYl7zTREpkwuyCLZWFGb-9PO39gKp8zFkqEc4t_jBcdE5GV-T8ctnD8_hkQnM9D&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=jUcko_0qtWJ4t-YLeKiEAA&_nc_ss=7a30f&oh=00_Af27YiIM5tBU9uPmyA_XS7lCQYpmzN5rtbOQ4kPsRhBwPQ&oe=69E855F1',
    alt: 'Colorful home interior',
  },
  // colorful-home-vertical-3
  {
    src: 'https://scontent.xx.fbcdn.net/v/t39.6806-6/672815225_4497021797184391_2254450750974048254_n.png?_nc_cat=111&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=4KkYH8-54SsQ7kNvwGhghew&_nc_oc=AdpJNio_WaXvIkloSWvCFmJwWa0wcoL9finilptuk5fJIYaSOAM8g-NWnubAFeveN0RAHqxe-pU3YBHh7ybHlI-L&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=WhrfoFdMQmPmojIQvdmDKQ&_nc_ss=7a30f&oh=00_Af1XlKmevkRyQWWusrDQ44-pbNlpFNauTiokwuROvIvm3A&oe=69E8757A',
    alt: 'Colorful home scene',
  },
  // colorful-home-vertical-1
  {
    src: 'https://scontent.xx.fbcdn.net/v/t39.6806-6/670260643_4371306203125531_1093895092404715068_n.png?_nc_cat=108&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=SfQF1ExIcgoQ7kNvwFihLUA&_nc_oc=AdpW2kuWs3XyAU-CYLGDw_agXlIjTjuyHBH6Zbu4ZMLLh1Gyc6-z-6CJnqw2a7-9VRMwxi7wia-g3eT8_DwV8C24&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=lSN-jw1aN74yMsB836rjcA&_nc_ss=7a30f&oh=00_Af1XZ2pKW47WXf7D-58RKWq3ddFfELc1C2vhDaJdSrAueA&oe=69E86F2B',
    alt: 'Colorful home vertical',
  },
  // colorful-lifestyle-horizontal-2
  {
    src: 'https://scontent.xx.fbcdn.net/v/t39.6806-6/671434591_1481606660072800_8012368080583907436_n.png?_nc_cat=111&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=1jIzvQ3OhF4Q7kNvwELzr-O&_nc_oc=AdqVeBjQk2OXWNGDXhn8nuzT_Z8e9_lt24_tADZ1HaOGeDQSapt5QTgh7_gogNuCLKpyfxILDufE5ZniUrqTOOl1&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=dvODr3eYtMdoe3Jd5KsuxQ&_nc_ss=7a30f&oh=00_Af2U5Q7atXhjhdKZWaO4NuhEyQvwmqiJMLDAxKp0NQQoag&oe=69E86743',
    alt: 'Colorful lifestyle wide',
  },
  // colorful-lifestyle-vertical-2
  {
    src: 'https://scontent.xx.fbcdn.net/v/t39.6806-6/670422313_1309114328024296_2325112857517486215_n.png?_nc_cat=106&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=UcKaimmopFkQ7kNvwHsrlYX&_nc_oc=AdoDC8bS92DGKLlNrj6JZNPWHMK-iEiLKysuFj5ovT5yZ2fD8qrkkpxk8w4Z0A-78I8lzoxHcIomk41gwykoaSTM&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=s5tiaRXtT-Qv4iFpKfZlUA&_nc_ss=7a30f&oh=00_Af0GQSB9llTL_KKLnxZFKILBjmuAlkJIAr205eUVvrFMeg&oe=69E84882',
    alt: 'Colorful lifestyle detail',
  },
  // colorful-lifestyle-vertical-4
  {
    src: 'https://scontent.xx.fbcdn.net/v/t39.6806-6/671971840_1715756549567950_672861276426865659_n.png?_nc_cat=106&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=9gFQdoQQugsQ7kNvwFY8re2&_nc_oc=Adrn7UNEJ5mxCqQJvrVCBfb0H8PKQog-RyBX8fPCKAib0Po1o2pCnHB9LJEbzYeLl32dVTX9LycSrRZw8EQ3vcHb&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=YfsLQvgrKBvW9w_wWJvN9Q&_nc_ss=7a30f&oh=00_Af24tnRP3Q0tt22Wz43oganzcTJsjHGhqefJvF2zK39Ucg&oe=69E879AC',
    alt: 'Colorful lifestyle portrait',
  },
];

// ─── Stat Block ─────────────────────────────────────────────────────────────

function StatBlock({value, label}: {value: string; label: string}) {
  return (
    <XDSVStack gap={0}>
      <XDSText type="large" weight="bold">
        {value}
      </XDSText>
      <XDSText type="supporting" color="secondary">
        {label}
      </XDSText>
    </XDSVStack>
  );
}

// ─── Image Grid ─────────────────────────────────────────────────────────────

function ImageGrid() {
  return (
    <XDSGrid columns={3} gap={3}>
      {IMAGES.map((img, i) => (
        <XDSAspectRatio key={i} ratio={1}>
          <img src={img.src} alt={img.alt} {...stylex.props(styles.image)} />
        </XDSAspectRatio>
      ))}
    </XDSGrid>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function SideGalleryTemplate() {
  return (
    <XDSAppShell height="auto" contentPadding={0} variant="surface">
      <XDSCenter axis="horizontal">
        <div {...stylex.props(styles.pageContainer)}>
          <div {...stylex.props(styles.splitLayout)}>
            {/* Left side: Text + CTA */}
            <XDSVStack gap={6} vAlign="center">
              <XDSVStack gap={3}>
                <XDSText type="supporting" color="secondary" weight="semibold">
                  DAIILY
                </XDSText>
                <XDSHeading level={1}>
                  Make every day a little more delightful, one small detail at a
                  time.
                </XDSHeading>
                <XDSText type="body" color="secondary">
                  We believe the smallest details are the ones that matter most.
                  A little color, a thoughtful touch, a moment that catches your
                  eye and makes you pause; that&apos;s what turns an ordinary
                  day into something worth remembering.
                </XDSText>
              </XDSVStack>

              <XDSHStack gap={3} vAlign="center">
                <XDSButton label="Explore" variant="primary" />
              </XDSHStack>

              <XDSVStack gap={4}>
                <XDSDivider />
                <XDSHStack gap={6}>
                  <StatBlock value="12k+" label="Photos" />
                  <StatBlock value="350+" label="Projects" />
                  <StatBlock value="8yrs" label="Experience" />
                </XDSHStack>
              </XDSVStack>
            </XDSVStack>

            {/* Right side: Image Grid */}
            <ImageGrid />
          </div>
        </div>
      </XDSCenter>
    </XDSAppShell>
  );
}
