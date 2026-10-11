import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Architects_Daughter } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const architectsDaughter = Architects_Daughter({
  weight: "400",
  variable: "--font-handwriting",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#1E43D8",
};

export const metadata: Metadata = {
  title: {
    default: "Astraea · Autonomous Factory Intelligence",
    template: "%s · Astraea",
  },
  description: "From engineering drawings to autonomous ASME Y14.5 verification and real-time shop-floor execution.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${architectsDaughter.variable} h-full antialiased`}
    >
      <head>
        <link rel="preload" as="image" href="/images/ezgif-frame-001.webp" type="image/webp" />
      </head>
      <body className="min-h-full flex flex-col bg-[#f4ebd7]">{children}</body>
    </html>
  );
}
