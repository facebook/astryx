'use client';

import {useState} from 'react';
import {XDSAppShell} from '@xds/core/AppShell';
import {XDSVStack} from '@xds/core/Layout';
import {XDSCenter} from '@xds/core/Center';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSGrid} from '@xds/core/Grid';
import {XDSAspectRatio} from '@xds/core/AspectRatio';
import {XDSSection} from '@xds/core/Section';

import {XDSTabList, XDSTab} from '@xds/core/TabList';
import * as stylex from '@stylexjs/stylex';

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = stylex.create({
  outer: {
    maxWidth: 1200,
    width: '100%',
    paddingInline: 'var(--spacing-6)',
    paddingBlock: 'var(--spacing-8)',
  },
  imageWrapper: {
    borderRadius: 'var(--radius-container)',
    overflow: 'clip',
  },
  textCenter: {
    textAlign: 'center',
  },
  imgFill: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
});

// ─── Gallery Data ───────────────────────────────────────────────────────────

type Category = 'all' | 'lifestyle' | 'scene' | 'home';

interface GalleryImage {
  src: string;
  alt: string;
  category: Category;
}

const GALLERY_IMAGES: GalleryImage[] = [
  {
    src: 'https://scontent.xx.fbcdn.net/v/t39.6806-6/672863405_1398068472358179_8859473259447111379_n.png?_nc_cat=100&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=-wV2jHO2HVUQ7kNvwHGzCzr&_nc_oc=AdrxH65fOWB9AYbTJt499HTYmTlEoQ2-Gq4v0HixJT92Mz5awWgcZNSxSTRZJPypWIDapoCWcQ2JcNruqRd9ovzp&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=ak5CKQPy-Mq6Vm7qld0MTw&_nc_ss=7a30f&oh=00_Af03yc18QziUpPjAs6EJMXwjb9gx2bfazL1ccL5840WQdw&oe=69E8390A',
    alt: 'Moody scene landscape',
    category: 'scene',
  },
  {
    src: 'https://scontent.xx.fbcdn.net/v/t39.6806-6/674064782_1780208822692052_3795473963216992279_n.png?_nc_cat=108&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=78Zl6OnaJ3gQ7kNvwHrbidO&_nc_oc=AdoPCiVZCbUF3lzrCI0jEGC2uYR14gHlJTZxVejhFyKoN1SctaHmMe-PlVXCoEmGEn01g05n2-Qai4TDHfCanT2r&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=5Ca_Vp6JYkgtj8PkyMQGcA&_nc_ss=7a30f&oh=00_Af15tUTHSdnlHE7qjvC28Kvf_GLUtkAyLxVfRO5eAY3kLQ&oe=69E84C07',
    alt: 'Moody lifestyle portrait',
    category: 'lifestyle',
  },
  {
    src: 'https://scontent.xx.fbcdn.net/v/t39.6806-6/671154433_1690063268839561_5090150051169696390_n.png?_nc_cat=104&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=Qq_R2DdWkjAQ7kNvwGoG6Gb&_nc_oc=AdpiIJkdZLHlCgoUTVQqq3ycMBrIC4BKwSNUVNqZMc27LaY_d_YZQmJCylhNOAqJXTZ1Xt95cEOcoBO4oqzdcDMW&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=rJE1zfBfSoNXYSp-jSwoDw&_nc_ss=7a30f&oh=00_Af3yobNIzECbq2tstiOFEMVnGnQE0wzgksyOhJKjNLMR9g&oe=69E83356',
    alt: 'Moody home interior',
    category: 'home',
  },
  {
    src: 'https://scontent.xx.fbcdn.net/v/t39.6806-6/670453429_1910969922884172_3094228467578042834_n.png?_nc_cat=108&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=YeICz52KdJEQ7kNvwFEVEr-&_nc_oc=Adr3iASjbPaVCp4m5c33SzEajLNl_Arj-XOaaxFda0aUdsJ9A-YhyrHnmM6DbvJMdy0SRu-IObUInYMtFT14AwId&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=Gh4mkg0GJh1nwlefERHleA&_nc_ss=7a30f&oh=00_Af19f_-e0ThVN5TfOrqSp3WkAVXX1eBsw5CvVBpEQg_0mw&oe=69E82DE6',
    alt: 'Moody scene vista',
    category: 'scene',
  },
  {
    src: 'https://scontent.xx.fbcdn.net/v/t39.6806-6/673866328_1278679930533651_9097451673261932422_n.png?_nc_cat=103&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=Icfd6-HDesIQ7kNvwEtOBIG&_nc_oc=Adoc6yPpfMZ3OlVJaqmMWGPwPgVfFN-D8-MLx4cMXtbmD2sc1fMurTEO2IQzYEOGV-tLIGEZ1bL9LqWKyOkecgYA&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=HBNKvpHT-ht2OXVWFqr1Hg&_nc_ss=7a30f&oh=00_Af1hHVggQoGf6bucCuuDoPnQyj1S-TUA3kQMJVH535ZSQQ&oe=69E839B9',
    alt: 'Moody lifestyle scene',
    category: 'lifestyle',
  },
  {
    src: 'https://scontent.xx.fbcdn.net/v/t39.6806-6/672246966_2022228332030059_1486026254113745156_n.png?_nc_cat=102&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=Db-kiXIpRagQ7kNvwEiuVls&_nc_oc=AdoOEVy32V7Oo1HAW4UIdu5zb6PRPViEHbk30rht43aVQP5lGl0NuWw71BhUPQvwdyplL2rVnXPLqsNStkejzAM9&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=VGciYJh11wjMyAWCDlqOkg&_nc_ss=7a30f&oh=00_Af2wuIbroUrp1bHYcHSviFfFpTSzDz7ylfw4_fNuEuCxXw&oe=69E82F15',
    alt: 'Moody lifestyle horizontal',
    category: 'lifestyle',
  },
  {
    src: 'https://scontent.xx.fbcdn.net/v/t39.6806-6/670668456_1850168808990410_1567515430860525015_n.png?_nc_cat=106&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=1r2TneN1xTIQ7kNvwFLqH4K&_nc_oc=AdpLJqj5zly7Z1RW9hkAPFSu6VM1smu-8ewfVZjBFgWnJiKsVcJgtdsOsi5DVY-pzYdpgAwNGq_3oF0ORDd1HXLl&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=S6P1v66QtL_kRxpiOn-UwQ&_nc_ss=7a30f&oh=00_Af0OdPMnIboqpeiIGi371xb5Wz-MYfVf8sGficMBkXdw9g&oe=69E84C2C',
    alt: 'Moody scene vertical',
    category: 'scene',
  },
  {
    src: 'https://scontent.xx.fbcdn.net/v/t39.6806-6/672681252_1712972356395547_4336697191547122977_n.png?_nc_cat=101&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=4ETrTLj0vK8Q7kNvwGLM0xl&_nc_oc=AdqkzIHYZxzOwoMZMwoA7yLWXTYym_tCwQ4FQbOym2Tp7Imv9xKmq3nCyf1DGql6iJ_4TzH8g5EPwdPjYPwzuSxt&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=_6B4sVgLj-zcDPPv_Br-jA&_nc_ss=7a30f&oh=00_Af1E_0XE2gOCpcBWDE-FmhmIRqzE9DQrCMvILT07KlVvgA&oe=69E82FA1',
    alt: 'Moody home vertical',
    category: 'home',
  },
  {
    src: 'https://scontent.xx.fbcdn.net/v/t39.6806-6/671420383_1473260394292788_982123928249290692_n.png?_nc_cat=106&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=zEGSNskdaZQQ7kNvwGbl9p3&_nc_oc=AdoBiMOc96dRnGJ0HNcPHsYglrop_BOmld856Nwo3dfatPreBpZMDwQyDf6djFkYW3Puo2CPINBhj6v8UQt5y0y0&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=LLHD2zOCqVKQysCimaPwRw&_nc_ss=7a30f&oh=00_Af1dQWMptFS2tFyIpHkxUxyV0EzDBhGfRAD8JvJC1VId9g&oe=69E863BA',
    alt: 'Moody home horizontal',
    category: 'home',
  },
  {
    src: 'https://scontent.xx.fbcdn.net/v/t39.6806-6/672683360_1484439649702521_3027582698795094818_n.png?_nc_cat=101&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=fJchBtIPlwMQ7kNvwGBKiAv&_nc_oc=AdqXyJ0W9AGsWYfpM0AaKwY9T4PVz0VAuZeKvRrKomtCrpk7D23PfL-zy-FN3cHwIkD-Ecessz0Gqu06t-uUAxYq&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=vu_KBIgBGT_4jn2B7cQWIg&_nc_ss=7a30f&oh=00_Af0AOLyC3ksPoOv7SeZLT3aT-uMSiUfzfYSOs6TUdk2H6A&oe=69E847BB',
    alt: 'Moody scene vertical',
    category: 'scene',
  },
];

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function ClassicGalleryTemplate() {
  const [filter, setFilter] = useState<Category>('all');

  const filteredImages =
    filter === 'all'
      ? GALLERY_IMAGES
      : GALLERY_IMAGES.filter(img => img.category === filter);

  return (
    <XDSAppShell height="auto" contentPadding={0} variant="surface">
      <XDSCenter axis="horizontal">
        <div {...stylex.props(styles.outer)}>
          <XDSVStack gap={8}>
            {/* Header */}
            <XDSCenter axis="horizontal">
              <XDSSection variant="transparent" maxWidth={680} padding={0}>
                <XDSVStack gap={4} hAlign="center" xstyle={styles.textCenter}>
                  <XDSVStack gap={2} hAlign="center">
                    <XDSHeading level={1}>
                      Make every day a little more delightful, one detail at a
                      time.
                    </XDSHeading>
                    <XDSText type="body" color="secondary">
                      We believe the smallest details are the ones that matter
                      most. A little color, a thoughtful touch, a moment that
                      catches your eye and makes you pause; that&apos;s what
                      turns an ordinary day into something worth remembering.
                    </XDSText>
                  </XDSVStack>

                  <XDSTabList
                    value={filter}
                    onChange={v => setFilter(v as Category)}>
                    <XDSTab value="all" label="All" />
                    <XDSTab value="lifestyle" label="Lifestyle" />
                    <XDSTab value="scene" label="Scenery" />
                    <XDSTab value="home" label="Home" />
                  </XDSTabList>
                </XDSVStack>
              </XDSSection>
            </XDSCenter>

            {/* Gallery Grid */}
            <XDSGrid minChildWidth={400} gap={4}>
              {filteredImages.map((image, i) => (
                <a key={i} href="#">
                  <XDSAspectRatio ratio={3 / 2} xstyle={styles.imageWrapper}>
                    <img
                      src={image.src}
                      alt={image.alt}
                      {...stylex.props(styles.imgFill)}
                    />
                  </XDSAspectRatio>
                </a>
              ))}
            </XDSGrid>
          </XDSVStack>
        </div>
      </XDSCenter>
    </XDSAppShell>
  );
}
