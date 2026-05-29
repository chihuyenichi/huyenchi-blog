/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/huyenchi-blog',
  assetPrefix: '/huyenchi-blog/',
}

module.exports = nextConfig
