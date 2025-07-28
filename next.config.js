/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'res.cloudinary.com', 
      'images.unsplash.com',
      'picsum.photos',
      'via.placeholder.com'
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // 性能优化配置
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
    // 启用 SWC 编译器的额外优化
    swcTraceProfiling: true,
  },
  
  // 压缩配置
  compress: true,
  
  // Webpack 配置优化
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // 优化模块解析
    config.resolve.alias = {
      ...config.resolve.alias,
      // 确保只使用一个 React 实例
      'react': require.resolve('react'),
      'react-dom': require.resolve('react-dom'),
    };

    // 基础优化设置
    config.optimization.sideEffects = false;

    return config;
  },

  // 输出配置
  output: 'standalone',
  
  // 页面扩展名
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  
  // 重定向配置
  async redirects() {
    return [
      {
        source: '/gallery/:path*',
        has: [
          {
            type: 'query',
            key: 'legacy',
            value: 'true',
          },
        ],
        destination: '/:path*',
        permanent: false,
      },
    ];
  },

  // Headers 配置
  async headers() {
    return [
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300',
          },
        ],
      },
    ];
  },

  // 环境变量
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY || 'default-value',
  },

  // 根据需要添加其他配置
};

// Bundle 分析器配置（可选）
if (process.env.ANALYZE === 'true') {
  const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: true,
  });
  module.exports = withBundleAnalyzer(nextConfig);
} else {
  module.exports = nextConfig;
}