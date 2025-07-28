import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '多端画廊 | Multi-Platform Gallery',
  description: '基于 Next.js 和 MongoDB 的响应式多端画廊应用',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <main className="min-h-screen bg-gray-50 text-gray-900">
          {children}
        </main>
      </body>
    </html>
  );
}