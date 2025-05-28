"use client"

import { motion } from "framer-motion"
import { getEmotionConversations, getEmotionColor } from "@/lib/emotion-utils"

interface EmotionHeatmapProps {
  className?: string
}

export function EmotionHeatmap({ className = "" }: EmotionHeatmapProps) {
  // 获取过去365天的日期
  const getDatesArray = (days: number) => {
    const dates = []
    const today = new Date()
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      dates.push(date.toISOString().split('T')[0])
    }
    
    return dates
  }

  // 获取情绪数据
  const conversations = getEmotionConversations()
  const emotionsByDate: Record<string, string[]> = {}
  
  conversations.forEach(conv => {
    const date = conv.createdAt.split('T')[0]
    if (!emotionsByDate[date]) {
      emotionsByDate[date] = []
    }
    emotionsByDate[date].push(conv.emotion)
  })

  // 生成过去365天的数据
  const dates = getDatesArray(365)
  const weeks: string[][] = []
  
  // 将日期按周分组
  for (let i = 0; i < dates.length; i += 7) {
    weeks.push(dates.slice(i, i + 7))
  }

  // 获取日期的情绪强度和颜色
  const getDateInfo = (date: string) => {
    const emotions = emotionsByDate[date] || []
    const count = emotions.length
    
    if (count === 0) {
      return { intensity: 0, color: 'bg-gray-100', tooltip: '无记录' }
    }
    
    // 使用最近的情绪作为主色调
    const mainEmotion = emotions[emotions.length - 1]
    const baseColor = getEmotionColor(mainEmotion)
    
    // 根据记录数量调整透明度
    let intensity = Math.min(count, 4) // 最大4级强度
    let opacity = ''
    
    switch (intensity) {
      case 1:
        opacity = 'opacity-30'
        break
      case 2:
        opacity = 'opacity-50'
        break
      case 3:
        opacity = 'opacity-75'
        break
      case 4:
        opacity = 'opacity-100'
        break
      default:
        opacity = 'opacity-30'
    }
    
    return {
      intensity,
      color: `${baseColor} ${opacity}`,
      tooltip: `${count} 条记录`
    }
  }

  const formatTooltipDate = (date: string) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className={`${className}`}>
      <div className="flex flex-col gap-2">
        {/* 月份标签 */}
        <div className="grid grid-cols-12 gap-2 text-xs text-gray-500 mb-2">
          {Array.from({ length: 12 }, (_, i) => {
            const month = new Date()
            month.setMonth(month.getMonth() - 11 + i)
            return (
              <div key={i} className="text-center">
                {month.toLocaleDateString('zh-CN', { month: 'short' })}
              </div>
            )
          })}
        </div>

        {/* 热力图网格 - 调整为更适合的布局 */}
        <div className="grid grid-cols-12 gap-1 auto-rows-min">
          {Array.from({ length: 365 }, (_, i) => {
            const date = new Date()
            date.setDate(date.getDate() - (364 - i))
            const dateString = date.toISOString().split('T')[0]
            const { color, tooltip } = getDateInfo(dateString)
            
            return (
              <motion.div
                key={dateString}
                className={`w-3 h-3 rounded-sm ${color} border border-gray-200 cursor-pointer transition-all hover:ring-2 hover:ring-blue-300`}
                title={`${formatTooltipDate(dateString)}: ${tooltip}`}
                whileHover={{ scale: 1.2 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.001 }}
              />
            )
          })}
        </div>

        {/* 图例 */}
        <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
          <span>过去一年</span>
          <div className="flex items-center gap-2">
            <span>少</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-gray-100 border border-gray-200"></div>
              <div className="w-3 h-3 rounded-sm bg-blue-200 opacity-30 border border-gray-200"></div>
              <div className="w-3 h-3 rounded-sm bg-blue-400 opacity-50 border border-gray-200"></div>
              <div className="w-3 h-3 rounded-sm bg-blue-500 opacity-75 border border-gray-200"></div>
              <div className="w-3 h-3 rounded-sm bg-blue-600 opacity-100 border border-gray-200"></div>
            </div>
            <span>多</span>
          </div>
        </div>
      </div>
    </div>
  )
} 