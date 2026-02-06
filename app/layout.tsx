import "../globals.css";
import { Manrope } from "next/font/google";
import { getEnv } from "../lib/env";
import { ToastProvider, ToastViewport } from "../components/ui/toast";

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans"
});

const display = Manrope({
  subsets: ["latin"],
  variable: "--font-display"
});

export const metadata = {
  title: "EdgePoint Strata",
  description: "EdgePoint Strata",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icons/pwa/android-launchericon-192-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/pwa/android-launchericon-512-512.png", sizes: "512x512", type: "image/png" },
      { url: "/icons/icon.svg" }
    ],
    apple: [
      { url: "/icons/pwa/152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/pwa/167.png", sizes: "167x167", type: "image/png" },
      { url: "/icons/pwa/180.png", sizes: "180x180", type: "image/png" }
    ]
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  getEnv();
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body className="font-sans">
        <ToastProvider>
          {children}
          <ToastViewport />
        </ToastProvider>
      </body>
    </html>
  );
}
