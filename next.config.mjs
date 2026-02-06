import withPWA from "next-pwa";

const nextConfig = {
  reactStrictMode: true
};

const disablePwa = process.env.DISABLE_PWA === "1";

const pwa = withPWA({
  dest: "public",
  disable: disablePwa || process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https?:\/\/.*\/api\/jobs(\/.*)?$/,
      handler: "NetworkFirst",
      options: {
        cacheName: "jobs-api",
        expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 }
      }
    },
    {
      urlPattern: /^https?:\/\/.*\/api\/time-entries(\/.*)?$/,
      handler: "NetworkFirst",
      options: {
        cacheName: "time-entries-api",
        expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 }
      }
    },
    {
      urlPattern: /\/app\/jobs/,
      handler: "NetworkFirst",
      options: {
        cacheName: "jobs-page",
        expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 }
      }
    },
    {
      urlPattern: /\/app\/time/,
      handler: "NetworkFirst",
      options: {
        cacheName: "time-page",
        expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 }
      }
    }
  ]
});

export default pwa(nextConfig);
