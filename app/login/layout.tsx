import { lusitana } from '@/app/ui/font';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${lusitana.className} antialiased`}>
      {children}
    </div>
  );
}