import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EdgePoint Strata",
    short_name: "Strata",
    description: "WorkflowMax-style job and time tracking",
    start_url: "/app/dashboard",
    display: "standalone",
    background_color: "#faf7f2",
    theme_color: "#0b0b12",
    icons: [
      {
        src: "/icons/pwa/android-launchericon-192-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icons/pwa/android-launchericon-192-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable"
      },
      {
        src: "/icons/pwa/android-launchericon-512-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icons/pwa/android-launchericon-512-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      },
      {
        src: "/icons/pwa/android-launchericon-144-144.png",
        sizes: "144x144",
        type: "image/png"
      },
      {
        src: "/icons/pwa/android-launchericon-96-96.png",
        sizes: "96x96",
        type: "image/png"
      },
      {
        src: "/icons/pwa/android-launchericon-72-72.png",
        sizes: "72x72",
        type: "image/png"
      },
      {
        src: "/icons/pwa/android-launchericon-48-48.png",
        sizes: "48x48",
        type: "image/png"
      },
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml"
      }
    ]
  };
}
