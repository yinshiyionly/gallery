export default function GalleryPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">画廊</h1>
      <div className="mb-6">
        {/* 搜索和筛选组件将在这里实现 */}
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* 媒体卡片将在这里渲染 */}
        {Array.from({ length: 12 }).map((_, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
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
    </div>
  );
}