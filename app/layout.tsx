import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '情绪气球 - 释放你的情绪',
  description: '在这里安全地表达情绪，通过虚拟气球释放内心压力，记录情绪历程。让我们陪伴你走过每一个情绪波动的时刻。',
  generator: 'Next.js',
  keywords: ['情绪管理', '心理健康', '情绪释放', '心理支持'],
  authors: [{ name: 'Emotion Balloon Team' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  )
}
