import {PreviewShell} from './PreviewShell';

export default function FullscreenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PreviewShell>{children}</PreviewShell>;
}
