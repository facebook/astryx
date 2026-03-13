import {Sidebar} from '../Sidebar';

export default function SandboxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{display: 'flex', minHeight: '100vh'}}>
      <Sidebar />
      <main style={{flex: 1, padding: '2rem'}}>{children}</main>
    </div>
  );
}
