import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MiniCard | Minimal mini golf scorecard",
  description: "Digital mini golf scorecard that runs entirely in your browser.",
  applicationName: "MiniCard",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MiniCard"
  },
  formatDetection: {
    telephone: false
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#020617"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
