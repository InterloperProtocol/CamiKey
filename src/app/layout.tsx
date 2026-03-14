import '@/app/globals.css';

export const metadata = {
  title: 'CAMIKey',
  description: 'Dexscreener-only chart sponsorship for Pump.fun livestream overlays.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
