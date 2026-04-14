'use client';

import React from 'react';

export {
  PlusIcon,
  LinkIcon,
  CheckIcon,
  HeartIcon,
  ChevronDownIcon,
  FolderIcon,
  ArrowLeftIcon,
  BookmarkIcon,
  ArrowRightIcon as SendIcon,
  PaintBrushIcon as PaletteIcon,
  SunIcon as ContrastIcon,
  ArrowUpTrayIcon as UploadIcon,
  ArrowUpTrayIcon as ShareIcon,
  ArrowDownTrayIcon as DownloadIcon,
  ArrowTopRightOnSquareIcon as ExternalLinkIcon,
  ArrowsPointingOutIcon as FullscreenIcon,
  Bars3Icon as HamburgerIcon,
  CodeBracketIcon as CodeIcon,
  ComputerDesktopIcon as DesktopIcon,
  CommandLineIcon as TerminalIcon,
  CursorArrowRaysIcon as CursorIcon,
  DevicePhoneMobileIcon as PhoneIcon,
  DocumentDuplicateIcon as CopyIcon,
  MagnifyingGlassIcon as SearchIcon,
  UserIcon as ProfileIcon,
  AdjustmentsHorizontalIcon as FilterIcon,
  Squares2X2Icon as GridIcon,
  SparklesIcon,
  StopIcon,
} from '@heroicons/react/24/outline';

export {BookmarkIcon as BookmarkFilledIcon} from '@heroicons/react/24/solid';

// Brand logos for theme picker

export const MetaLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 287.56 191" fill="none" {...props}>
    <defs>
      <linearGradient id="meta-g1" x1="61" y1="117" x2="259" y2="127" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0064e1" /><stop offset="0.4" stopColor="#0064e1" /><stop offset="0.83" stopColor="#0073ee" /><stop offset="1" stopColor="#0082fb" />
      </linearGradient>
      <linearGradient id="meta-g2" x1="45" y1="139" x2="45" y2="66" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0082fb" /><stop offset="1" stopColor="#0064e0" />
      </linearGradient>
    </defs>
    <path fill="#0081fb" d="m31.06,125.96c0,10.98 2.41,19.41 5.56,24.51 4.13,6.68 10.29,9.51 16.57,9.51 8.1,0 15.51-2.01 29.79-21.76 11.44-15.83 24.92-38.05 33.99-51.98l15.36-23.6c10.67-16.39 23.02-34.61 37.18-46.96 11.56-10.08 24.03-15.68 36.58-15.68 21.07,0 41.14,12.21 56.5,35.11 16.81,25.08 24.97,56.67 24.97,89.27 0,19.38-3.82,33.62-10.32,44.87-6.28,10.88-18.52,21.75-39.11,21.75l0-31.02c17.63,0 22.03-16.2 22.03-34.74 0-26.42-6.16-55.74-19.73-76.69-9.63-14.86-22.11-23.94-35.84-23.94-14.85,0-26.8,11.2-40.23,31.17-7.14,10.61-14.47,23.54-22.7,38.13l-9.06,16.05c-18.2,32.27-22.81,39.62-31.91,51.75-15.95,21.24-29.57,29.29-47.5,29.29-21.27,0-34.72-9.21-43.05-23.09-6.8-11.31-10.14-26.15-10.14-43.06z" />
    <path fill="url(#meta-g1)" d="m24.49,37.3c14.24-21.95 34.79-37.3 58.36-37.3 13.65,0 27.22,4.04 41.39,15.61 15.5,12.65 32.02,33.48 52.63,67.81l7.39,12.32c17.84,29.72 27.99,45.01 33.93,52.22 7.64,9.26 12.99,12.02 19.94,12.02 17.63,0 22.03-16.2 22.03-34.74l27.4-.86c0,19.38-3.82,33.62-10.32,44.87-6.28,10.88-18.52,21.75-39.11,21.75-12.8,0-24.14-2.78-36.68-14.61-9.64-9.08-20.91-25.21-29.58-39.71l-25.79-43.08c-12.94-21.62-24.81-37.74-31.68-45.04-7.39-7.85-16.89-17.33-32.05-17.33-12.27,0-22.69,8.61-31.41,21.78z" />
    <path fill="url(#meta-g2)" d="m82.35,31.23c-12.27,0-22.69,8.61-31.41,21.78-12.33,18.61-19.88,46.33-19.88,72.95 0,10.98 2.41,19.41 5.56,24.51l-26.48,17.44c-6.8-11.31-10.14-26.15-10.14-43.06 0-30.75 8.44-62.8 24.49-87.55 14.24-21.95 34.79-37.3 58.36-37.3z" />
  </svg>
);

export const WhatsAppLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 175.216 175.552" fill="none" {...props}>
    <defs>
      <linearGradient id="wa-g" x1="85.915" y1="32.567" x2="86.535" y2="137.092" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#57d163" /><stop offset="1" stopColor="#23b33a" />
      </linearGradient>
    </defs>
    <path fill="url(#wa-g)" d="M87.184 25.227c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 009.349 32.535l1.455 2.313-6.179 22.558 23.146-6.069 2.235 1.324c9.387 5.571 20.15 8.517 31.126 8.523h.023c33.707 0 61.14-27.426 61.153-61.135a60.75 60.75 0 00-17.895-43.251 60.75 60.75 0 00-43.235-17.928z" />
    <path fill="#fff" fillRule="evenodd" d="M68.772 55.603c-1.378-3.061-2.828-3.123-4.137-3.176l-3.524-.043c-1.226 0-3.218.46-4.902 2.3s-6.435 6.287-6.435 15.332 6.588 17.785 7.506 19.013 12.718 20.381 31.405 27.75c15.529 6.124 18.689 4.906 22.061 4.6s10.877-4.447 12.408-8.74 1.532-7.971 1.073-8.74-1.685-1.226-3.525-2.146-10.877-5.367-12.562-5.981-2.91-.919-4.137.921-4.746 5.979-5.819 7.206-2.144 1.381-3.984.462-7.76-2.861-14.784-9.124c-5.465-4.873-9.154-10.891-10.228-12.73s-.114-2.835.808-3.751c.825-.824 1.838-2.147 2.759-3.22s1.224-1.84 1.836-3.065.307-2.301-.153-3.22-4.032-10.011-5.666-13.647" />
  </svg>
);

// Theme icons — distinctive identifiers for each theme

export const DefaultThemeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 20 20" fill="currentColor" {...props}>
    <rect x="2" y="2" width="7" height="7" rx="2" fill="#0066FF" />
    <rect x="11" y="2" width="7" height="7" rx="2" fill="#3B82F6" opacity={0.6} />
    <rect x="2" y="11" width="7" height="7" rx="2" fill="#93C5FD" opacity={0.4} />
    <rect x="11" y="11" width="7" height="7" rx="2" fill="#DBEAFE" opacity={0.3} />
  </svg>
);

export const NeutralThemeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 20 20" fill="none" {...props}>
    <circle cx="10" cy="10" r="8" stroke="#525252" strokeWidth="2" />
    <path d="M10 2a8 8 0 010 16V2z" fill="#525252" />
  </svg>
);

export const BrutalistThemeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 20 20" fill="none" {...props}>
    <path d="M10 1L19 10L10 19L1 10Z" fill="#FF1493" />
    <path d="M10 5L15 10L10 15L5 10Z" fill="#fff" />
  </svg>
);

export const DailyThemeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 20 20" fill="none" {...props}>
    <circle cx="10" cy="10" r="4" fill="#0064E0" />
    {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
      <line key={deg} x1="10" y1="2" x2="10" y2="4.5" stroke="#0064E0" strokeWidth="1.8" strokeLinecap="round" transform={`rotate(${deg} 10 10)`} />
    ))}
  </svg>
);

export const ForestThemeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 20 20" fill="none" {...props}>
    <path d="M10 2C10 2 4 8 4 12.5C4 15.5 6.7 18 10 18C13.3 18 16 15.5 16 12.5C16 8 10 2 10 2Z" fill="#2D8A4E" />
    <path d="M10 10V17" stroke="#1A5C33" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M10 13C8.5 11.5 7 12 7 12" stroke="#1A5C33" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

export const SunsetThemeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 20 20" fill="none" {...props}>
    <path d="M3 14h14" stroke="#E5484D" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M5 14a5 5 0 0110 0" fill="#E5484D" />
    <path d="M10 3v2M15.5 8.5l-1.4 1.4M4.5 8.5l1.4 1.4M17 14h0M3 14h0" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const MidnightThemeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 20 20" fill="none" {...props}>
    <path d="M15.5 11.5A6.5 6.5 0 018.5 4.5 6.5 6.5 0 1015.5 11.5z" fill="#818CF8" />
    <circle cx="14" cy="5" r="1" fill="#818CF8" opacity={0.6} />
    <circle cx="16.5" cy="8" r="0.6" fill="#818CF8" opacity={0.4} />
  </svg>
);

// Brand icons — no Heroicons equivalent

export const ClaudeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 248 248" fill="none" {...props}>
    <path
      d="M52.4285 162.873L98.7844 136.879L99.5485 134.602L98.7844 133.334H96.4921L88.7237 132.862L62.2346 132.153L39.3113 131.207L17.0249 130.026L11.4214 128.844L6.2 121.873L6.7094 118.447L11.4214 115.257L18.171 115.847L33.0711 116.911L55.485 118.447L71.6586 119.392L95.728 121.873H99.5485L100.058 120.337L98.7844 119.392L97.7656 118.447L74.5877 102.732L49.4995 86.1905L36.3823 76.62L29.3779 71.7757L25.8121 67.2858L24.2839 57.3608L30.6515 50.2716L39.3113 50.8623L41.4763 51.4531L50.2636 58.1879L68.9842 72.7209L93.4357 90.6804L97.0015 93.6343L98.4374 92.6652L98.6571 91.9801L97.0015 89.2625L83.757 65.2772L69.621 40.8192L63.2534 30.6579L61.5978 24.632C60.9565 22.1032 60.579 20.0111 60.579 17.4246L67.8381 7.49965L71.9133 6.19995L81.7193 7.49965L85.7946 11.0443L91.9074 24.9865L101.714 46.8451L116.996 76.62L121.453 85.4816L123.873 93.6343L124.764 96.1155H126.292V94.6976L127.566 77.9197L129.858 57.3608L132.15 30.8942L132.915 23.4505L136.608 14.4708L143.994 9.62643L149.725 12.344L154.437 19.0788L153.8 23.4505L150.998 41.6463L145.522 70.1215L141.957 89.2625H143.994L146.414 86.7813L156.093 74.0206L172.266 53.698L179.398 45.6635L187.803 36.802L193.152 32.5484H203.34L210.726 43.6549L207.415 55.1159L196.972 68.3492L188.312 79.5739L175.896 96.2095L168.191 109.585L168.882 110.689L170.738 110.53L198.755 104.504L213.91 101.787L231.994 98.7149L240.144 102.496L241.036 106.395L237.852 114.311L218.495 119.037L195.826 123.645L162.07 131.592L161.696 131.893L162.137 132.547L177.36 133.925L183.855 134.279H199.774L229.447 136.524L237.215 141.605L241.8 147.867L241.036 152.711L229.065 158.737L213.019 154.956L175.45 145.977L162.587 142.787H160.805V143.85L171.502 154.366L191.242 172.089L215.82 195.011L217.094 200.682L213.91 205.172L210.599 204.699L188.949 188.394L180.544 181.069L161.696 165.118H160.422V166.772L164.752 173.152L187.803 207.771L188.949 218.405L187.294 221.832L181.308 223.959L174.813 222.777L161.187 203.754L147.305 182.486L136.098 163.345L134.745 164.2L128.075 235.42L125.019 239.082L117.887 241.8L111.902 237.31L108.718 229.984L111.902 215.452L115.722 196.547L118.779 181.541L121.58 162.873L123.291 156.636L123.14 156.219L121.773 156.449L107.699 175.752L86.304 204.699L69.3663 222.777L65.291 224.431L58.2867 220.768L58.9235 214.27L62.8713 208.48L86.304 178.705L100.44 160.155L109.551 149.507L109.462 147.967L108.959 147.924L46.6977 188.512L35.6182 189.93L30.7788 185.44L31.4156 178.115L33.7079 175.752L52.4285 162.873Z"
      fill="#D97757"
    />
  </svg>
);

export const VSCodeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" {...props}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M70.9119 99.3171C72.4869 99.9307 74.2828 99.8914 75.8725 99.1264L96.4608 89.2197C98.6242 88.1787 100 85.9892 100 83.5872V16.4133C100 14.0113 98.6243 11.8218 96.4609 10.7808L75.8725 0.873756C73.7862 -0.130129 71.3446 0.11576 69.5135 1.44695C69.252 1.63711 69.0028 1.84943 68.769 2.08341L29.3551 38.0415L12.1872 25.0096C10.589 23.7965 8.35363 23.8959 6.86933 25.2461L1.36303 30.2549C-0.452552 31.9064 -0.454633 34.7627 1.35853 36.417L16.2471 50.0001L1.35853 63.5832C-0.454633 65.2374 -0.452552 68.0938 1.36303 69.7453L6.86933 74.7541C8.35363 76.1043 10.589 76.2037 12.1872 74.9905L29.3551 61.9587L68.769 97.9167C69.3925 98.5406 70.1246 99.0104 70.9119 99.3171ZM75.0152 27.2989L45.1091 50.0001L75.0152 72.7012V27.2989Z"
      fill="#007ACC"
    />
  </svg>
);

export const CursorAIIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 512 512" fill="none" {...props}>
    <path
      d="M415.035 156.35l-151.503-87.4695c-4.865-2.8094-10.868-2.8094-15.733 0l-151.4969 87.4695c-4.0897 2.362-6.6146 6.729-6.6146 11.459v176.383c0 4.73 2.5249 9.097 6.6146 11.458l151.5039 87.47c4.865 2.809 10.868 2.809 15.733 0l151.504-87.47c4.089-2.361 6.614-6.728 6.614-11.458v-176.383c0-4.73-2.525-9.097-6.614-11.459zm-9.516 18.528l-146.255 253.32c-.988 1.707-3.599 1.01-3.599-.967v-165.872c0-3.314-1.771-6.379-4.644-8.044l-143.645-82.932c-1.707-.988-1.01-3.599.968-3.599h292.509c4.154 0 6.75 4.503 4.673 8.101h-.007z"
      fill="currentColor"
    />
  </svg>
);

// Layout icon — no Heroicons equivalent

export const SidebarIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="9" y1="3" x2="9" y2="21" />
  </svg>
);

// Floppy-disk save icon — no Heroicons equivalent

export const SaveIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);
