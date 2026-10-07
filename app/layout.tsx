import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { TITLE, DESCRIPTION } from "@/lib/site-meta";

// Cloudflare Web Analytics: gratis, sin cookies, ilimitado. El token sale del
// panel de Cloudflare después de crear el sitio; se pasa como env var al build.
const CF_BEACON_TOKEN = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN;

// Umami Cloud: trackea el embudo (país elegido, mensaje generado, click en
// Gmail/Outlook, compartido — ver lib/analytics.ts). Website ID sale del
// panel de Umami; se pasa como env var al build.
const UMAMI_WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#14181f",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        {children}
        {CF_BEACON_TOKEN && (
          <Script
            src="https://static.cloudflareinsights.com/beacon.min.js"
            strategy="afterInteractive"
            data-cf-beacon={JSON.stringify({ token: CF_BEACON_TOKEN })}
          />
        )}
        {UMAMI_WEBSITE_ID && (
          <Script
            src="https://cloud.umami.is/script.js"
            strategy="afterInteractive"
            data-website-id={UMAMI_WEBSITE_ID}
          />
        )}
      </body>
    </html>
  );
}
