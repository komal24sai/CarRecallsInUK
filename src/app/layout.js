import "./globals.css";

export const metadata = {
  title: "IsThisCarSafe — Vehicle Safety Intelligence Powered by DVSA",
  description: "Check MOT history, safety recalls, and future part failure predictions for any UK used car. Powered by official DVSA data.",
  keywords: "MOT history, vehicle recalls, DVSA, car safety, UK vehicle check",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
