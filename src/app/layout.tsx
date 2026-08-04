import type { Metadata } from "next";
import "./globals.css";
import "./modern.css";
import { AuthProvider } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Property Reply — BMV Marketplace",
  description:
    "Access thousands of verified below-market-value properties across the UK. From flips to HMOs, every deal analysed and ready to act on.",
  icons: {
    icon: [{ url: "/assets/favicon.png", type: "image/png" }],
    shortcut: "/assets/favicon.png",
    apple: "/assets/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/assets/favicon.png" type="image/png" />
        <link rel="shortcut icon" href="/assets/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/assets/favicon.png" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
