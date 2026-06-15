/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  // basePath conditionnel pour le preview dev (BASE_PATH=/preview npm run dev)
  ...(process.env.BASE_PATH ? { basePath: process.env.BASE_PATH } : {}),
  async headers() {
    // La home (et /dashboard) sont des URLs de Mini App : on empêche la mise en cache du
    // document HTML pour que la webview Telegram charge toujours le dernier bundle JS.
    const noStore = [
      { key: "Cache-Control", value: "no-cache, no-store, max-age=0, must-revalidate" },
    ];
    return [
      { source: "/", headers: noStore },
      { source: "/dashboard", headers: noStore },
    ];
  },
};

export default nextConfig;
