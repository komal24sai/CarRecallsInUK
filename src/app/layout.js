import "./globals.css";

export const metadata = {
  title: "isthiscarsafe — Vehicle Safety Intelligence Powered by DVSA",
  description: "Check MOT history, safety recalls, and vehicle risk scores for any UK-registered vehicle. Powered by official DVSA data with Bronze→Silver→Gold data engineering.",
  keywords: "MOT history, vehicle recalls, DVSA, car safety, UK vehicle check",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
