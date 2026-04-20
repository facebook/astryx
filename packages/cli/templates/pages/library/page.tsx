'use client';

import {useState, useMemo} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSLayout, XDSLayoutHeader, XDSLayoutContent} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSCard} from '@xds/core/Card';
import {XDSAspectRatio} from '@xds/core/AspectRatio';
import {XDSToggleButton, XDSToggleButtonGroup} from '@xds/core/ToggleButton';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSDivider} from '@xds/core/Divider';
import {XDSGrid} from '@xds/core/Grid';
import {XDSHStack, XDSVStack} from '@xds/core/Stack';
import {XDSDropdownMenu} from '@xds/core/DropdownMenu';
import {colorVars, spacingVars} from '@xds/core/theme/tokens.stylex';
import {XDSAppShell} from '@xds/core/AppShell';
import {
  XDSSideNav,
  XDSSideNavHeading,
  XDSSideNavSection,
  XDSSideNavItem,
} from '@xds/core/SideNav';
import {XDSNavIcon} from '@xds/core/NavIcon';
import {XDSIcon} from '@xds/core/Icon';
import {XDSCenter} from '@xds/core/Center';
import {
  HomeIcon,
  BookOpenIcon,
  CubeIcon,
  Squares2X2Icon,
  WrenchScrewdriverIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  BookOpenIcon as BookOpenIconSolid,
} from '@heroicons/react/24/solid';

interface LibraryItem {
  id: string;
  name: string;
  description: string;
  category: string;
  type: 'Component' | 'Pattern' | 'Utility';
  image: string;
  imageUrl?: string;
}

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const CATEGORIES = ['All', 'Layout', 'Forms', 'Navigation', 'Feedback', 'Data'];

const ITEMS: LibraryItem[] = [
  {
    id: '1',
    name: 'Stack',
    description:
      'Vertical and horizontal stack layouts with configurable gap and alignment.',
    category: 'Layout',
    type: 'Component',
    image: 'colorful-home-horizontal-1.png',
    imageUrl:
      'https://scontent.xx.fbcdn.net/v/t39.6806-6/672709173_900474269697313_6817386054486922176_n.png?_nc_cat=100&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=iIKb1WSCA14Q7kNvwGlNbtn&_nc_oc=AdrykiMeaxgFAE7bYt7z3hrFgV9LYf_9OAEl0WKkCvVeRM5d-vwPK4CSUS6UcBY2w32qurQLty2efstnWXpTWLlW&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=lByw0uq5VDQ8mcm62_f1LQ&_nc_ss=7a30f&oh=00_Af0U55E1N7MKjOx-TgGtLKR0kOjec6KNYS-grrcKKw4umw&oe=69E748BB',
  },
  {
    id: '2',
    name: 'Grid',
    description:
      'Responsive grid container with auto-fit columns and gap control.',
    category: 'Layout',
    type: 'Component',
    image: 'illustrative-horizontal-3.jpg',
    imageUrl:
      'https://scontent.xx.fbcdn.net/v/t39.6806-6/672674636_1739232910577387_6597229795491381664_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=BHpXUpN7WVUQ7kNvwEoQ0_b&_nc_oc=AdoVUiw3wwLFb0IrwYYyhIJ0-tqsnKcrjtjVvJaGJ9KicJIy5yvMkoDtTuSwNjaWlGI3V7m6vaCvhuUxGyaAswes&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=rPIUj9G_99-PoGk-J_CpMw&_nc_ss=7a30f&oh=00_Af31VV984jck27zRyjZg9HBF1NBm4B2-euqQkM-xHKFdwQ&oe=69E724D2',
  },
  {
    id: '3',
    name: 'Card',
    description:
      'Surface container with optional padding, border, and shadow variants.',
    category: 'Layout',
    type: 'Component',
    image: 'light-working-horizontal-2.png',
    imageUrl:
      'https://scontent.xx.fbcdn.net/v/t39.6806-6/671588323_987740997112258_5691335682748609046_n.png?_nc_cat=105&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=WfIfjZO9-6sQ7kNvwET2M4I&_nc_oc=AdrsKKSvOhHILrhSNxECxKHSnMiOUwFs-gPh4MEUaOYJNwNfN_pcmEiOgD8ciJnwQZw_j5lHk7GqMDbnsDtOU1HO&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=YgeO6a-1uDi2whRBCAa7Dg&_nc_ss=7a30f&oh=00_Af0_221vTnLTwGIvpURmeFou_8FA2JwR83Cdz9ynLmWp1A&oe=69E74B08',
  },
  {
    id: '4',
    name: 'Center',
    description: 'Centers its child both horizontally and vertically.',
    category: 'Layout',
    type: 'Utility',
    image: 'moody-scene-horizontal-1.png',
    imageUrl:
      'https://scontent.xx.fbcdn.net/v/t39.6806-6/672863405_1398068472358179_8859473259447111379_n.png?_nc_cat=100&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=-wV2jHO2HVUQ7kNvwHII-Es&_nc_oc=AdobiagnGPar0u1nxTOwq9u6H-QVDvZGi4KE3WIhesgGIMcw2F55ipAAHIuXzMEmV9ywAH8vKhaOJHGKmh6UD1T0&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=OuLzeHkv5fq8T3II_JVUPg&_nc_ss=7a30f&oh=00_Af1K-F656__KQnYSFduAeNg-umQEbvABm3hxJ7CALSkzLg&oe=69E71FCA',
  },
  {
    id: '5',
    name: 'Section',
    description: 'Semantic page section with optional heading and divider.',
    category: 'Layout',
    type: 'Pattern',
    image: 'colorful-lifestyle-horizontal-2.png',
    imageUrl:
      'https://scontent.xx.fbcdn.net/v/t39.6806-6/671434591_1481606660072800_8012368080583907436_n.png?_nc_cat=111&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=1jIzvQ3OhF4Q7kNvwEoj_Gm&_nc_oc=Adrj9SBr9bUSpxL-EY9wc30ipgEcYIfB4iiq8igirMRQYEQ7oq5X5GAEQkZ6NTizrR2HYSsBKnp1wHNRQuWc7cEK&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=48TBZohsWnEw9HKapVXTxQ&_nc_ss=7a30f&oh=00_Af02FH4Ts_KZsOOraMrIwb5MUWKf_EYPkbeokaTVsR27aA&oe=69E74E03',
  },
  {
    id: '6',
    name: 'Collapsible',
    description: 'Expandable region with animated height transition.',
    category: 'Layout',
    type: 'Component',
    image: 'light-scene-horizontal-1.png',
    imageUrl:
      'https://scontent.xx.fbcdn.net/v/t39.6806-6/670900322_26625087630454957_5308285999469581630_n.png?_nc_cat=108&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=uACEMOhCsoIQ7kNvwF3ME1M&_nc_oc=AdqwA4epXgqLkKkURZ7TQ6cuG_sMElGDJQ1ycxqDoQnOSH28h85A4RGCoaByKQqkgH1Z1QVvSyt3dx1IPyvrVUt9&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=p_Pm4pNbFaXCdziuHy7INA&_nc_ss=7a30f&oh=00_Af2ek2MJbu2tKRgGyzg4RATqxcDziUHQ7fRRNhZ0z_DdyQ&oe=69E73804',
  },
  {
    id: '7',
    name: 'TextInput',
    description:
      'Single-line text field with label, placeholder, and validation states.',
    category: 'Forms',
    type: 'Component',
    image: 'moody-working-horizontal-1.png',
    imageUrl:
      'https://scontent.xx.fbcdn.net/v/t39.6806-6/672159311_4447867172115241_7002602233372379744_n.png?_nc_cat=103&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=bEIa0XYhihoQ7kNvwG92GtN&_nc_oc=Ado8n5cUXW_AF8dkBxE6zoKRGaNh5pihVSTt9HJh6WZ_b7gMfOk75oyXWsDKx9ITKL7oZOelQtQkPM12dEynS7VS&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=6kTkFzsznxojh0657IsK_Q&_nc_ss=7a30f&oh=00_Af31Y-cyfQiRA4TNjUEWb8l_aSeCUJO8paZ-1K6uYecSsA&oe=69E756DD',
  },
  {
    id: '8',
    name: 'TextArea',
    description: 'Multi-line text field with auto-resize and character count.',
    category: 'Forms',
    type: 'Component',
    image: 'colorful-working-horizontal-3.png',
    imageUrl:
      'https://scontent.xx.fbcdn.net/v/t39.6806-6/673504783_1487897739608810_1925416936910686772_n.png?_nc_cat=104&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=yNTx65GXD_kQ7kNvwHv_Urw&_nc_oc=AdofHQuLGAHKN_pEOGasb3eOYPn9s91MnmYahXX2q6vB6bRDeGkmrrBckgidP26f420sZ3XtEN0kUoe1zehdPIgB&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=VpzOQXA2qYAF3C_RKo1mqQ&_nc_ss=7a30f&oh=00_Af0v3wkloCLB4H6IaITDZS1t5rL8hl0LBobKfqD4sa-q4Q&oe=69E730B5',
  },
  {
    id: '9',
    name: 'CheckboxInput',
    description: 'Checkbox with label, indeterminate state, and group support.',
    category: 'Forms',
    type: 'Component',
    image: 'illustrative-horizontal-1.jpg',
    imageUrl:
      'https://scontent.xx.fbcdn.net/v/t39.6806-6/670836735_2461791954280697_1048571955964692895_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=NE4GxGlZyM4Q7kNvwFvh2dn&_nc_oc=AdqA_axYcnif8e7X3F_08gK0eFVqvwMHvodahTa1yiG4tjAf1QVEyTcgs0N_O7LnNF8wc6bYGN051y0SS5XHnPGU&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=yoM-5mc94Qw5KMkDII0Dmg&_nc_ss=7a30f&oh=00_Af3Ng9srmSE0jG3NRRcyTh0RMObfG7AHok0p_mqPNUxu4w&oe=69E732EB',
  },
  {
    id: '10',
    name: 'RadioList',
    description: 'Group of radio buttons with accessible fieldset wrapper.',
    category: 'Forms',
    type: 'Component',
    image: 'light-home-horizontal-1.png',
    imageUrl:
      'https://scontent.xx.fbcdn.net/v/t39.6806-6/672683340_1522469159433922_7776167798061220106_n.png?_nc_cat=101&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=Qpd2UWP6VgEQ7kNvwESFt5K&_nc_oc=AdqEX8phEGjPJBOBrUiZY3HZNVQxII6j-cz4H6hBlNDUdGLOpKxDJv_oDECxUHu0UoYd_bWTEdLwpdfedgx-tYxw&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=6qjfHI4jCN_yeerKAI-Ccg&_nc_ss=7a30f&oh=00_Af334kbGGZUHHMBe9bzaqTnEWI6O6lP2rX9Pq1NfBL646A&oe=69E75514',
  },
  {
    id: '11',
    name: 'Switch',
    description: 'Toggle switch for binary on/off settings.',
    category: 'Forms',
    type: 'Component',
    image: 'moody-home-horizontal-2.png',
    imageUrl:
      'https://scontent.xx.fbcdn.net/v/t39.6806-6/671154433_1690063268839561_5090150051169696390_n.png?_nc_cat=104&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=4OEnOHJ_CqEQ7kNvwHCDrrW&_nc_oc=AdpGok83uauCw-axF6-3SkecVRTT5R24qvFw2Y6MF8dS26snubO2VAjK9MgjHBUWeYuI7DiX-7zZuqNo_ycZtueE&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=f5YlFZMpCAD5hTnQFSA_Cw&_nc_ss=7a30f&oh=00_Af3KrcrwaATyNjVXpeoOYyz5DJ5_GSx1Ln5Y73mRlvjxuw&oe=69E75256',
  },
  {
    id: '12',
    name: 'Selector',
    description:
      'Dropdown or inline option selector with single and multi-select modes.',
    category: 'Forms',
    type: 'Component',
    image: 'colorful-product-1.png',
    imageUrl:
      'https://scontent.xx.fbcdn.net/v/t39.6806-6/670431376_2105383320320432_5814727365028419900_n.png?_nc_cat=100&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=ReoRfmbGsCsQ7kNvwFlXC-A&_nc_oc=Adr5Y-gt_d62iycutG1Zi958UparRSdkEdn42N6xkOeTMzzv4Jx1nK_caBsRXKHM-LZhAw7_tQcIHCZE4k_40RWP&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=_cim9u3VWjUrUazZk7pjlQ&_nc_ss=7a30f&oh=00_Af04wvI_DuxPoklNexvJr2_-P6b0JXjK0wFWoEu8c8vJOQ&oe=69E7219D',
  },
  {
    id: '13',
    name: 'TabList',
    description:
      'Horizontal tab navigation with underline indicator and keyboard support.',
    category: 'Navigation',
    type: 'Component',
    image: 'illustrative-horizontal-5.jpg',
    imageUrl:
      'https://scontent.xx.fbcdn.net/v/t39.6806-6/671996506_1459966745508173_9056303866152525429_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=w0UFY5p0b5oQ7kNvwE6jyis&_nc_oc=AdrgGt_0Hil_5lsoaiRamp5vZ-v5PcHHjLDls2fNJwJWrsoZ7y0TJ2CBV2ZcN02qprSEWG98savkQfwa1vqcmQLs&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=tPcVNKagtFV1KJ1ed9fFIQ&_nc_ss=7a30f&oh=00_Af3XdWQ3oP8MZPJbQI8eQSYYDTOMaY-VRstnYvTr8r-IEw&oe=69E75380',
  },
  {
    id: '14',
    name: 'TopNav',
    description: 'Application top bar with logo, nav links, and action slots.',
    category: 'Navigation',
    type: 'Pattern',
    image: 'light-working-horizontal-1.png',
    imageUrl:
      'https://scontent.xx.fbcdn.net/v/t39.6806-6/672683095_926730176788181_131978982706421059_n.png?_nc_cat=111&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=SwQeB8Ch8QQQ7kNvwGnRPa7&_nc_oc=AdpR1vWOj6y2UnFjArt9ozlTmDmt_v_GNZpmepQJILtTy53i-E9joQhuBI8QIoxZt3Da6nsC9YuAfoLYsg7Vn5Th&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=ha069IrkcZ8XB5d2u5p6Qg&_nc_ss=7a30f&oh=00_Af3ba1vZqPqEW_QBK0Tx46p-navZTCBrn1Luz8c5Ci2OAg&oe=69E73D29',
  },
  {
    id: '15',
    name: 'SideNav',
    description:
      'Vertical sidebar navigation with collapsible groups and active states.',
    category: 'Navigation',
    type: 'Pattern',
    image: 'moody-lifestyle-horizontal-1.png',
    imageUrl:
      'https://scontent.xx.fbcdn.net/v/t39.6806-6/672683283_927387496774236_4070733631712753485_n.png?_nc_cat=106&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=zunS4L-kPCIQ7kNvwEwWkz1&_nc_oc=Adqcan8m196zBZtNvWy0aWWHZyA5K1mCP5Q7qeboS8s4J8NOxyaUjsw8_dLg8AZD-nux6IeqzeaN9E_dRPLW0sQO&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=VX8GZ5LhkQu_NGXTuZMX1A&_nc_ss=7a30f&oh=00_Af0rcs3BPHgzcFKIxZGW2XQZIsfv9JZPHFIdLcuP3JTC1Q&oe=69E71F38',
  },
  {
    id: '16',
    name: 'Breadcrumbs',
    description: 'Path trail navigation with separator and truncation support.',
    category: 'Navigation',
    type: 'Component',
    image: 'colorful-home-horizontal-2.png',
    imageUrl:
      'https://scontent.xx.fbcdn.net/v/t39.6806-6/670881450_1516722106735012_4194149430288072444_n.png?_nc_cat=100&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=0D9gv2qI-FIQ7kNvwF3_NCl&_nc_oc=AdqJGqxaSuzUZKou7L7Tkz1ds8zeg7rgAsncs1zifbxzhF1LsIJhltcVgSdsjjeS7mELDpojUATUy0c2iOzTAlBB&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=FfAWGOtY7TVrEMjYAvjZgQ&_nc_ss=7a30f&oh=00_Af0_gTkerUQ4_tTUM69LJHv63eMATps4KyN9sCvHQGvXaA&oe=69E7462A',
  },
  {
    id: '17',
    name: 'Pagination',
    description:
      'Page navigation with prev/next controls and page count display.',
    category: 'Navigation',
    type: 'Component',
    image: 'colorful-working-horizontal-1.png',
    imageUrl:
      'https://scontent.xx.fbcdn.net/v/t39.6806-6/670744023_3535923059888739_5550832236433536986_n.png?_nc_cat=100&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=XsEB8JQy7oYQ7kNvwFA-gN2&_nc_oc=Adqaf_tLomimdUolWeCuqDhkSUsrUirJ-GDWNgRO0J8G6FGM3oV1PPVXMkKOYGNp3Rw_aTg8BKoo2rvXhvK76HMq&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=_sNOTrHCWzF_rO5odgcLbw&_nc_ss=7a30f&oh=00_Af3tMVt2BG56V2DudVJIBEPWlh9hd_b5GCtF-FYj3A4lAA&oe=69E73449',
  },
  {
    id: '18',
    name: 'MobileNav',
    description:
      'Bottom tab bar for mobile viewports with icon and label slots.',
    category: 'Navigation',
    type: 'Pattern',
    image: 'light-working-horizontal-3.png',
    imageUrl:
      'https://scontent.xx.fbcdn.net/v/t39.6806-6/673941911_26516873217954372_8426801068656596725_n.png?_nc_cat=103&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=jyp_gpiGVO8Q7kNvwEL0lJS&_nc_oc=AdpqyKit2i58CmhBpOXXcItj3QNRqROkrc-dDf5f0IXOjKnu9o4yAaVLJvs4h2PfSwRfyJ_AU-acxGuViZi6HXt_&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=AwOqDUeqjU1TY_A_BIJ6_g&_nc_ss=7a30f&oh=00_Af1eke4KFZHL8xKZAW9o9lBm8imFN_zuFZ_ZlKtINez8Ew&oe=69E72391',
  },
  {
    id: '19',
    name: 'Badge',
    description:
      'Compact label for status, count, or category with semantic color variants.',
    category: 'Feedback',
    type: 'Component',
    image: 'moody-working-horizontal-2.png',
    imageUrl:
      'https://scontent.xx.fbcdn.net/v/t39.6806-6/672681829_1455818443002340_3278091928414998674_n.png?_nc_cat=111&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=vCRXkxiQIzAQ7kNvwFBqK6q&_nc_oc=Adp_33IHyMy66cMoKYWVZrjMjJeTxQT-50D10Jxg_oou9OkgjOGrCdQwFHNGmbJ5AjOMhSrQHpEzgs7KXDGmb2tm&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=d2Iq9kq-Nrr8cW2NOcufsg&_nc_ss=7a30f&oh=00_Af0_EAo3WEnWC7PYt6OzOHOzm3FeXixnteqPTq4ubNTAQg&oe=69E73A10',
  },
  {
    id: '20',
    name: 'Banner',
    description:
      'Full-width alert bar for info, success, warning, and error messages.',
    category: 'Feedback',
    type: 'Component',
    image: 'illustrative-horizontal-2.jpg',
    imageUrl:
      'https://scontent.xx.fbcdn.net/v/t39.6806-6/672815225_1876405093020036_2561561570479095601_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=PSy-GTVfE0UQ7kNvwH690eQ&_nc_oc=AdqhOtKGbSX_adJ3Fa6LFL2c1xTmlbhcsqQYHctZ5SpxfJff64DWNm2LBXbGkiSzYZKpxwqnrW5rNpQkm6DTBn37&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=y1Gbx96VY_8wpsolyUdM9w&_nc_ss=7a30f&oh=00_Af0VOkJLPNKG42BbYeOaQQRdC_3I4M5JA1dF1wOaKxn-WQ&oe=69E7559E',
  },
  {
    id: '21',
    name: 'Spinner',
    description: 'Animated loading indicator with size and color variants.',
    category: 'Feedback',
    type: 'Component',
    image: 'colorful-lifestyle-horizontal-1.png',
    imageUrl:
      'https://scontent.xx.fbcdn.net/v/t39.6806-6/670869277_2384531585379073_4187196261303804271_n.png?_nc_cat=109&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=k42Doxes-E8Q7kNvwHnm_Pl&_nc_oc=Adpt6QPDf1U4EkSOEbFoz4GxnzlDikgTBxxYvycB8schEpeFjU1aGU-yRkGOOAKGZ71dGOCmsCiG1zT-pB-Hxkw5&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=2jVTNXR1Pi2BZsn6Jr1MhQ&_nc_ss=7a30f&oh=00_Af3ibqe2LFfDrXWzuJm3H5KMJCua1uM_xRz7T5b5RYkrhg&oe=69E74AEF',
  },
  {
    id: '22',
    name: 'ProgressBar',
    description: 'Horizontal bar indicating task completion percentage.',
    category: 'Feedback',
    type: 'Component',
    image: 'light-lifestyle-horizontal-1.png',
    imageUrl:
      'https://scontent.xx.fbcdn.net/v/t39.6806-6/673173617_1842726693762408_2908608806392112143_n.png?_nc_cat=107&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=y8uaA8M8_e4Q7kNvwGEJXk-&_nc_oc=AdpMxtpsxksfsuD3TQyVW48cn6SFvah41MABc0Xaz0gdCzOztfcGTJvczrJE0s87rXruPjf-i_NAMzRngeqlz2oG&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=2yxu1WO0OG_L8M-D3lfPsQ&_nc_ss=7a30f&oh=00_Af3tnODxWJ9xoSXgzPy1EWLRHUQplbsmMbZP08pX1taAQA&oe=69E74B16',
  },
  {
    id: '23',
    name: 'StatusDot',
    description:
      'Small dot indicator for presence, health, or pipeline status.',
    category: 'Feedback',
    type: 'Component',
    image: 'moody-home-horizontal-1.png',
    imageUrl:
      'https://scontent.xx.fbcdn.net/v/t39.6806-6/671420383_1473260394292788_982123928249290692_n.png?_nc_cat=106&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=yi-ios3IYhMQ7kNvwEoRhJg&_nc_oc=AdrhOasEIgHy2jJFMtBZS49J1zLJJ3TYIrbrDAVLJgTiYzHrLaWSx-KjMDyhE-mB_ut9P563-SGU9EkUarT_HJtD&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=T4LBo43crSQ65qS7Hf8Hkg&_nc_ss=7a30f&oh=00_Af0IXAO-geyl3Bo9vnbbVdr7Cony-FSC6V8QgsjgdOwRpQ&oe=69E74A7A',
  },
  {
    id: '24',
    name: 'Tooltip',
    description:
      'Contextual label that appears on hover with configurable placement.',
    category: 'Feedback',
    type: 'Component',
    image: 'colorful-working-horizontal-2.png',
    imageUrl:
      'https://scontent.xx.fbcdn.net/v/t39.6806-6/671960592_1009710475063658_2065693335736770676_n.png?_nc_cat=110&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=d1I34HzGJIgQ7kNvwE76zBz&_nc_oc=AdrTjXcjX8m02E351dP7IA0f_qzdwIc4rj5NfWZUcroCJwwkmdZ4VwBmnPK7MryEQfAl9uJZoBB3BxzevYn1Gix7&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=fOIN55siBUYYDqShZz41SQ&_nc_ss=7a30f&oh=00_Af0ddX5F4DYMqu7vRcvFgXu3vTFCJsvmb4X3PRB_GECb-Q&oe=69E74041',
  },
  {
    id: '25',
    name: 'Table',
    description:
      'Feature-rich data table with sorting, selection, and column resizing.',
    category: 'Data',
    type: 'Component',
    image: 'illustrative-horizontal-4.jpg',
    imageUrl:
      'https://scontent.xx.fbcdn.net/v/t39.6806-6/673819168_896838673380430_7926069171483718115_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=E_bUfMuhz4YQ7kNvwHeTnX4&_nc_oc=AdoWBgfFaWe5LHPefccZpIg8PyVxNpIvtPyeYF1_dsi-7mzo6fGPvRvKc81VeNJ2Mf3-OaHEpNmw1Iz8dHghwCuh&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=QUE2D2INKK-crEd-07Oaww&_nc_ss=7a30f&oh=00_Af1j46BN2ZB8VXq0dCfAMsWnqf0V76aZYaYUb36KzYod3A&oe=69E73137',
  },
  {
    id: '26',
    name: 'Avatar',
    description:
      'User profile image with fallback initials and status dot support.',
    category: 'Data',
    type: 'Component',
    image: 'light-working-horizontal-4.png',
    imageUrl:
      'https://scontent.xx.fbcdn.net/v/t39.6806-6/670782061_1465787481666092_4758309193867168327_n.png?_nc_cat=108&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=kiWta8Q-B5cQ7kNvwFG-zhL&_nc_oc=AdpDM5oMLbozn80LUq67-YNd1X9Q3R4G8qlfLFF-03UgAO33GBmTBpyHQszqG3LkIsKI5XRIq0kjzYdj0DxZ97go&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=lVwu1Oe7ADW3rpKGaHKB8w&_nc_ss=7a30f&oh=00_Af0hYeq2MeAgBQbckZ3TczCvZ8fy2z-rKM9SaxrmdaNifg&oe=69E72542',
  },
  {
    id: '27',
    name: 'Skeleton',
    description:
      'Placeholder shimmer for loading states matching content shapes.',
    category: 'Data',
    type: 'Utility',
    image: 'moody-lifestyle-horizontal-2.png',
    imageUrl:
      'https://scontent.xx.fbcdn.net/v/t39.6806-6/672246966_2022228332030059_1486026254113745156_n.png?_nc_cat=102&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=Db-kiXIpRagQ7kNvwF3i3VR&_nc_oc=AdoibvMuexh6CU0sRu5UUIcS8OyAg0TtdmhDrNgwicabAutlJEO2mbv0zv87BcmI7voqmhizar4MtaX9K-eHoIPw&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=mB9th-kxGXONckJrV3nvNQ&_nc_ss=7a30f&oh=00_Af0CSzEEVsruF6wADGXMIWv8CP7ZiAkPSlOIvXGpP7utkg&oe=69E74E15',
  },
  {
    id: '28',
    name: 'HoverCard',
    description: 'Rich popover that appears on hover with arbitrary content.',
    category: 'Data',
    type: 'Component',
    image: 'moody-scene-horizontal-2.png',
    imageUrl:
      'https://scontent.xx.fbcdn.net/v/t39.6806-6/670453429_1910969922884172_3094228467578042834_n.png?_nc_cat=108&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=YeICz52KdJEQ7kNvwG6zl45&_nc_oc=AdqYEHq-qOh59wMFxQD3TCOtRX1Se7PNk2TnKFYKYeoCaLYa2QoyVJXgVJVwq_3Q1QklgCdIQIxfnTy4GYThl8YA&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=QSACCIkk-b-VRoYlvgoH1g&_nc_ss=7a30f&oh=00_Af20Nx1Vp40iNSp2OzZzDUECElFi3MewFaWwQcPWF3elPQ&oe=69E74CE6',
  },
  {
    id: '29',
    name: 'PowerSearch',
    description:
      'Command-palette style search with grouped results and keyboard nav.',
    category: 'Data',
    type: 'Pattern',
    image: 'colorful-product-2.png',
    imageUrl:
      'https://scontent.xx.fbcdn.net/v/t39.6806-6/671278299_2157174751769935_4279004491845469910_n.png?_nc_cat=103&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=izE9T3P8DIsQ7kNvwFLOTcb&_nc_oc=AdpG1igzhXXs0FXlQP1fnIkxQnO8ckNSByC6ttELHnEtWoNrELMBaZGgg4z5Q8US81J9TXq1VSLBy7IyP5w4wiXO&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=0TN5EU9a1uXOJ0ek6CJukQ&_nc_ss=7a30f&oh=00_Af1vLg89rqmR-cXwNDdaglipjq6NBzGJbdsgw6q1jGisEA&oe=69E73766',
  },
  {
    id: '30',
    name: 'Typeahead',
    description:
      'Autocomplete input with async suggestion loading and selection.',
    category: 'Data',
    type: 'Component',
    image: 'moody-working-horizontal-3.png',
    imageUrl:
      'https://scontent.xx.fbcdn.net/v/t39.6806-6/673879002_1270196958005953_766590773162291_n.png?_nc_cat=105&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=rJzYEsicq4kQ7kNvwF2PAr6&_nc_oc=Adppyqa2FWPcX_w_31qGyJXN4HMi9sFkOomdNPp5k8cYJzx0lNk26KFRsr9OwyZowrDpWDIaBd-GiUOb8xei8StE&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=7g2E2PaaP4wVp5kprcvUuQ&_nc_ss=7a30f&oh=00_Af3UGlsMFJs8zwMC8Ofh9UfPsWBE1u1gkcNlAKPzqrWtgw&oe=69E730EB',
  },
];

const styles = stylex.create({
  sectionTop: {
    paddingTop: spacingVars['--spacing-4'],
  },
  thumbnail: {
    backgroundColor: colorVars['--color-background-muted'],
    width: '100%',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  cardBody: {
    padding: spacingVars['--spacing-4'],
  },
  hideOnSmall: {
    display: {
      default: 'none',
      '@media (min-width: 840px)': 'block',
    },
  },
  hideOnLarge: {
    display: {
      default: 'block',
      '@media (min-width: 840px)': 'none',
    },
  },
});

// =============================================================================
// Side Nav
// =============================================================================

function LibraryNav() {
  return (
    <XDSSideNav
      header={
        <XDSSideNavHeading
          icon={
            <XDSNavIcon
              icon={<XDSIcon icon={CubeIcon} size="sm" color="inherit" />}
            />
          }
          heading="My App"
          headingHref="#"
        />
      }>
      <XDSSideNavSection title="Main">
        <XDSSideNavItem
          label="Home"
          href="#"
          icon={HomeIcon}
          selectedIcon={HomeIconSolid}
        />
        <XDSSideNavItem
          label="Library"
          href="#"
          icon={BookOpenIcon}
          selectedIcon={BookOpenIconSolid}
          isSelected
        />
      </XDSSideNavSection>
      <XDSSideNavSection title="Browse">
        <XDSSideNavItem label="Components" href="#" icon={Squares2X2Icon} />
        <XDSSideNavItem
          label="Templates"
          href="#"
          icon={WrenchScrewdriverIcon}
        />
      </XDSSideNavSection>
    </XDSSideNav>
  );
}

function LibraryCard({item}: {item: LibraryItem}) {
  return (
    <XDSCard padding={0}>
      <XDSAspectRatio ratio={16 / 9} xstyle={styles.thumbnail}>
        <img
          {...stylex.props(styles.thumbnailImage)}
          src={item.imageUrl}
          alt={item.name}
        />
      </XDSAspectRatio>
      <XDSVStack gap={1} xstyle={styles.cardBody}>
        <XDSHeading level={3}>{item.name}</XDSHeading>
        <XDSText type="body" size="sm" color="secondary">
          {item.description}
        </XDSText>
      </XDSVStack>
    </XDSCard>
  );
}

function LibrarySection({
  category,
  items,
}: {
  category: string;
  items: LibraryItem[];
}) {
  return (
    <XDSVStack gap={6}>
      <XDSHeading level={2}>{category}</XDSHeading>
      <XDSGrid columns={{minWidth: 320}} gap={4}>
        {items.map(item => (
          <LibraryCard key={item.id} item={item} />
        ))}
      </XDSGrid>
    </XDSVStack>
  );
}

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('A-Z');

  const filtered = useMemo(() => {
    let items =
      activeTab === 'All' ? ITEMS : ITEMS.filter(i => i.category === activeTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        i =>
          i.name.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q),
      );
    }
    return items;
  }, [activeTab, search]);

  const groupedSections = useMemo(() => {
    if (activeTab !== 'All') return null;
    const order = CATEGORIES.filter(c => c !== 'All');
    const map = new Map<string, LibraryItem[]>();
    for (const item of filtered) {
      if (!map.has(item.category)) map.set(item.category, []);
      map.get(item.category)!.push(item);
    }
    return order
      .filter(cat => map.has(cat))
      .map(cat => ({category: cat, items: map.get(cat)!}));
  }, [activeTab, filtered]);

  return (
    <XDSAppShell sideNav={<LibraryNav />} contentPadding={0}>
      <XDSLayout
        header={
          <XDSLayoutHeader hasDivider padding={6}>
            <XDSHeading level={1}>Library</XDSHeading>
          </XDSLayoutHeader>
        }
        content={
          <XDSLayoutContent padding={6}>
            <XDSVStack gap={6}>
              <XDSVStack gap={4}>
                <XDSTextInput
                  label="Search"
                  isLabelHidden
                  placeholder="Search..."
                  value={search}
                  onChange={setSearch}
                  startIcon={MagnifyingGlassIcon}
                  size="lg"
                />
                <XDSHStack vAlign="center" hAlign="between">
                  <div {...stylex.props(styles.hideOnSmall)}>
                    <XDSToggleButtonGroup
                      label="Filter by category"
                      value={activeTab}
                      onChange={v => setActiveTab(v ?? 'All')}>
                      {CATEGORIES.map(cat => (
                        <XDSToggleButton
                          key={cat}
                          label={cat}
                          value={cat}
                          size="lg"
                        />
                      ))}
                    </XDSToggleButtonGroup>
                  </div>
                  <div {...stylex.props(styles.hideOnLarge)}>
                    <XDSDropdownMenu
                      button={{label: activeTab, size: 'lg'}}
                      items={CATEGORIES.map(cat => ({
                        label: cat,
                        onClick: () => setActiveTab(cat),
                      }))}
                    />
                  </div>
                  <XDSDropdownMenu
                    button={{label: sortOrder, size: 'lg'}}
                    items={[
                      {label: 'A-Z', onClick: () => setSortOrder('A-Z')},
                      {label: 'Z-A', onClick: () => setSortOrder('Z-A')},
                      {label: 'Newest', onClick: () => setSortOrder('Newest')},
                    ]}
                  />
                </XDSHStack>
              </XDSVStack>

              {filtered.length === 0 ? (
                <XDSCenter>
                  <XDSText type="supporting" color="secondary">
                    No results found.
                  </XDSText>
                </XDSCenter>
              ) : groupedSections != null ? (
                <XDSVStack gap={6}>
                  {groupedSections.flatMap(section => [
                    <XDSDivider key={`d-${section.category}`} />,
                    <LibrarySection
                      key={section.category}
                      category={section.category}
                      items={section.items}
                    />,
                  ])}
                </XDSVStack>
              ) : (
                <XDSGrid
                  columns={{minWidth: 320}}
                  gap={4}
                  xstyle={styles.sectionTop}>
                  {filtered.map(item => (
                    <LibraryCard key={item.id} item={item} />
                  ))}
                </XDSGrid>
              )}
            </XDSVStack>
          </XDSLayoutContent>
        }
      />
    </XDSAppShell>
  );
}
