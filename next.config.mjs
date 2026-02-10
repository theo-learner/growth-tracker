/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/growth-tracker',
  assetPrefix: '/growth-tracker/',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
