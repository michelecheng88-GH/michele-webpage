import type { Metadata } from "next";
import "./globals.css";
import { SiteChrome } from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: "Michele Cheng — S.A.F.E.R. AI™ for Singapore SMEs",
  description:
    "AI implementation and program management guidance for Singapore SME leaders. Take the free S.A.F.E.R. AI readiness quiz.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col antialiased">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
