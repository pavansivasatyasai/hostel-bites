import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = { title: 'Hostel Shop', description: 'Hostel grocery delivery' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
