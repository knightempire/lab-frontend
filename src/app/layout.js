import './globals.css';
import ClientLayout from '../components/ClientLayout';

export const metadata = {
  title: 'Amuda Lab Management',
  icons: {
    icon: {
      url: '/images/icon.png',
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
      </head>
      <body className="h-full">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
