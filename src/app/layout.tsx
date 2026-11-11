import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import "./globals.css";

export const metadata: Metadata = {
  title: "Meditations of St. Thomas Aquinas, O.P. — For Every Day",
  description:
    "Daily meditations adapted from the Latin of Father Mezard, O.P. by Father E. C. McEniry, O.P. (1941), arranged for every day of the year according to the traditional liturgical calendar.",
  keywords: [
    "St. Thomas Aquinas",
    "meditations",
    "daily meditations",
    "Father McEniry",
    "Dominican",
    "liturgical calendar",
    "Summa Theologica",
    "devotional",
  ],
  authors: [{ name: "Father E. C. McEniry, O.P." }],
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Meditations of St. Thomas Aquinas, O.P. — For Every Day",
    description:
      "A 1941 daily devotional of the Angelic Doctor's writings, arranged for the traditional liturgical year.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400..700;1,400..600&display=swap"
          rel="stylesheet"
        />
        <style>{`:root { --font-book: "EB Garamond", Georgia, "Times New Roman", serif; }`}</style>
      </head>
      <body className="antialiased bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
