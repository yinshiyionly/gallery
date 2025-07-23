import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="mb-6 text-4xl font-bold text-center">
          多端画廊 | Multi-Platform Gallery
        </h1>
        <p className="mb-8 text-xl text-center max-w-2xl mx-auto">
          基于 Next.js 和 MongoDB 的响应式多端画廊应用，提供优秀的用户体验和美观的界面设计。
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 示例卡片 - 后续将从数据库获取 */}
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02] hover:shadow-lg"
            >
              <div className="relative h-48 w-full">
                <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
              </div>
              <div className="p-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2 animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link
            href="/gallery"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            浏览画廊
          </Link>
        </div>
      </div>
    </div>
  );
}