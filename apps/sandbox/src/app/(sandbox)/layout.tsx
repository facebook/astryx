import {SandboxShell} from '../SandboxShell';

export default function SandboxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SandboxShell>{children}</SandboxShell>;
}
