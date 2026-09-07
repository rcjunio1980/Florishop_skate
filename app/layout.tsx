import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FLORISHOP SKATE - Skate, Estilo & Atitude',
  description: 'Loja especializada em artigos para skate. Shapes, trucks, rodas, lixas e streetwear autêntico.',
  openGraph: {
    title: 'FLORISHOP SKATE - Skate, Estilo & Atitude',
    description: 'Equipamentos de alta performance para quem vive o asfalto.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Geist:wght@400;500;600&family=JetBrains+Mono:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning className="bg-[#131313] text-[#e5e2e1] antialiased min-h-screen font-sans selection:bg-[#ff544b] selection:text-white">
        {children}
      </body>
    </html>
  );
}
