import "./globals.css";

export const metadata = {
  title: "IsThisCarSafe — Vehicle Safety Intelligence Powered by DVSA",
  description: "Check MOT history, safety recalls, and future part failure predictions for any UK used car. Powered by official DVSA data.",
  keywords: "MOT history, vehicle recalls, DVSA, car safety, UK vehicle check",
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f4f7fb' },
    { media: '(prefers-color-scheme: dark)', color: '#0D0F14' },
  ],
  colorScheme: 'light dark',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var savedTheme = localStorage.getItem('app-theme');
              var theme = savedTheme;
              if (!theme) {
                theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
              }
              document.documentElement.setAttribute('data-theme', theme);
              
              var savedContrast = localStorage.getItem('app-contrast');
              var contrast = savedContrast || 'normal';
              document.documentElement.setAttribute('data-contrast', contrast);
            } catch (e) {
              document.documentElement.setAttribute('data-theme', 'dark');
              document.documentElement.setAttribute('data-contrast', 'normal');
            }
          })();
        ` }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
