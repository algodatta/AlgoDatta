/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  webpack: (config) => {
    // Ensure "@/..." resolves to the frontend root, regardless of tsconfig presence
    config.resolve.alias = config.resolve.alias || {};
    if (!config.resolve.alias['@']) {
      config.resolve.alias['@'] = path.resolve(__dirname);
    }
    return config;
  },
};

module.exports = nextConfig;
