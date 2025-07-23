/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['res.cloudinary.com', 'images.unsplash.com'],
    formats: ['image/avif', 'image/webp'],
  },
  // 根据需要添加其他配置
};

module.exports = nextConfig;