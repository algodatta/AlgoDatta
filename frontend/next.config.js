
/** @type {import('next').NextConfig} */

const nextConfig = {

  output: 'standalone',          // <- server runtime, no static export

  reactStrictMode: true,

  experimental: { typedRoutes: true },

};

module.exports = nextConfig;

