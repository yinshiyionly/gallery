import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-900 border-t dark:border-gray-800">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">多端画廊</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              一个基于 Next.js 和 MongoDB 构建的响应式画廊应用，提供优雅的用户体验和高性能的媒体展示功能。
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">快速链接</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-500"
                >
                  首页
                </Link>
              </li>
              <li>
                <Link
                  href="/gallery"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-500"
                >
                  画廊
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">技术栈</h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li>Next.js 14</li>
              <li>TypeScript</li>
              <li>MongoDB</li>
              <li>Tailwind CSS</li>
              <li>Framer Motion</li>
            </ul>
          </div>
        </div>

        <div className="border-t dark:border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            &copy; {currentYear} 多端画廊. 保留所有权利.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-4">
            <Link
              href="#"
              className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-500"
            >
              隐私政策
            </Link>
            <Link
              href="#"
              className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-500"
            >
              使用条款
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};