export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="mb-6 text-4xl font-bold text-center">
          多端画廊 | Multi-Platform Gallery
        </h1>
        <p className="mb-8 text-xl text-center max-w-2xl mx-auto">
          基于 Next.js 和 MongoDB 的响应式多端画廊应用
        </p>
        <div className="mt-12 text-center">
          <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
            浏览画廊
          </button>
        </div>
      </div>
    </div>
  );
}