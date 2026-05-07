import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Disha AI — Your AI Career Identity Mentor",
  description:
    "Discover careers you're truly meant for. Disha AI combines IKIGAI philosophy, emotional intelligence, and AI to guide you toward meaningful work — personalized for Indian students and professionals.",
  keywords: [
    "AI career guidance",
    "IKIGAI",
    "career mentor",
    "career counseling India",
    "student career guidance",
    "AI mentor",
    "career discovery",
    "Tier-2 India careers",
  ],
  authors: [{ name: "Disha AI" }],
  openGraph: {
    title: "Disha AI — Your AI Career Identity Mentor",
    description:
      "Find purpose. Build your future. AI that truly understands your career path.",
    type: "website",
    url: "https://disha-ai.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Disha AI — AI Career Mentor",
    description: "Discover work you're meant for.",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#7c3aed",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
