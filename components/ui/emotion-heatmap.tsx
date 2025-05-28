"use client"

import { motion } from "framer-motion"
import { getEmotionConversations, getEmotionColor } from "@/lib/emotion-utils"

interface EmotionHeatmapProps {
  className?: string
}

export function EmotionHeatmap({ className = "" }: EmotionHeatmapProps) {
  // 获取过去52周的日期数据（364天）
  const getWeeksData = () => {
    const weeks = []
    const today = new Date()
    
    // 计算从今天开始往前364天
    for (let weekIndex = 51; weekIndex >= 0; weekIndex--) {
      const week = []
      for (let dayIndex = 6; dayIndex >= 0; dayIndex--) {
        const date = new Date(today)
        date.setDate(date.getDate() - (weekIndex * 7 + dayIndex))
        week.unshift(date.toISOString().split('T')[0])
      }
      weeks.push(week)
    }
    
    return weeks
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

  // 获取日期的情绪信息
  const getDateInfo = (date: string) => {
    const emotions = emotionsByDate[date] || []
    const count = emotions.length
    
    if (count === 0) {
      return { 
        intensity: 0, 
        style: { backgroundColor: '#f3f4f6' }, 
        hoverStyle: { backgroundColor: '#e5e7eb' },
        tooltip: '无记录' 
      }
    }
    
    // 使用最近的情绪作为主色调
    const mainEmotion = emotions[emotions.length - 1]
    
    // 根据记录数量调整强度
    const intensity = Math.min(count, 4)
    
    // 获取情绪颜色
    const emotionColor = getEmotionColor(mainEmotion)
    
    // 颜色映射到具体的RGB值 - 根据实际情绪类型
    const emotionColorValues: Record<string, string[]> = {
      'angry': ['#fca5a5', '#f87171', '#ef4444', '#dc2626'],      // 愤怒 - 红色
      'sad': ['#93c5fd', '#60a5fa', '#3b82f6', '#2563eb'],        // 悲伤 - 蓝色  
      'anxious': ['#fcd34d', '#f59e0b', '#d97706', '#b45309'],    // 焦虑 - 琥珀色
      'happy': ['#86efac', '#4ade80', '#22c55e', '#16a34a'],      // 快乐 - 绿色
      'calm': ['#c084fc', '#a855f7', '#9333ea', '#7c3aed'],       // 平静 - 紫色
      'confused': ['#a5b4fc', '#818cf8', '#6366f1', '#4f46e5'],   // 困惑 - 靛蓝色
    }
    
    // 对于自定义情绪，从emotionColor中提取颜色
    let colors = emotionColorValues[mainEmotion]
    
    if (!colors) {
      // 从CSS class中解析颜色 - 使用默认蓝色系列
      colors = emotionColorValues['sad']
      
      // 如果能识别颜色类型，使用对应颜色系列
      if (emotionColor.includes('red')) {
        colors = emotionColorValues['angry']
      } else if (emotionColor.includes('green')) {
        colors = emotionColorValues['happy']
      } else if (emotionColor.includes('purple')) {
        colors = emotionColorValues['calm']
      } else if (emotionColor.includes('yellow') || emotionColor.includes('amber')) {
        colors = emotionColorValues['anxious']
      } else if (emotionColor.includes('indigo')) {
        colors = emotionColorValues['confused']
      }
    }
    
    const color = colors[intensity - 1]
    const hoverColor = colors[Math.min(intensity, 3)] // hover时稍微深一点
    
    return {
      intensity,
      style: { backgroundColor: color },
      hoverStyle: { backgroundColor: hoverColor },
      tooltip: `${count} 条记录`
    }
  }

  const formatTooltipDate = (date: string) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric'
    })
  }

  const weeksData = getWeeksData()
  
  // 生成月份标签
  const getMonthLabels = () => {
    const labels = []
    const today = new Date()
    
    for (let i = 11; i >= 0; i--) {
      const month = new Date(today)
      month.setMonth(month.getMonth() - i)
      labels.push(month.toLocaleDateString('zh-CN', { month: 'short' }))
    }
    
    return labels
  }

  return (
    <div className={`${className}`}>
      <div className="overflow-x-auto">
        {/* 月份标签 */}
        <div className="flex justify-between text-xs text-gray-500 mb-2 min-w-max">
          {getMonthLabels().map((month, i) => (
            <span key={i} className="w-8 text-center">{month}</span>
          ))}
        </div>

        {/* 热力图网格 */}
        <div className="flex gap-1 min-w-max">
          {weeksData.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((date, dayIndex) => {
                const { style, hoverStyle, tooltip } = getDateInfo(date)
                const isToday = date === new Date().toISOString().split('T')[0]
                
                return (
                  <motion.div
                    key={date}
                    className={`w-3 h-3 rounded-sm border border-gray-200 cursor-pointer transition-all duration-200 ${
                      isToday ? 'ring-2 ring-blue-400 ring-offset-1' : ''
                    }`}
                    style={style}
                    title={`${formatTooltipDate(date)}: ${tooltip}`}
                    onMouseEnter={(e) => {
                      Object.assign(e.currentTarget.style, hoverStyle)
                    }}
                    onMouseLeave={(e) => {
                      Object.assign(e.currentTarget.style, style)
                    }}
                    whileHover={{ scale: 1.2 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: (weekIndex * 7 + dayIndex) * 0.002 }}
                  />
                )
              })}
            </div>
          ))}
        </div>

        {/* 周标签和图例 */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <span>周一</span>
            <div className="w-px h-3 bg-gray-300 mx-1"></div>
            <span>周三</span>
            <div className="w-px h-3 bg-gray-300 mx-1"></div>
            <span>周五</span>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>少</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-gray-100 border border-gray-200"></div>
              <div className="w-3 h-3 rounded-sm bg-green-200 border border-gray-200"></div>
              <div className="w-3 h-3 rounded-sm bg-green-300 border border-gray-200"></div>
              <div className="w-3 h-3 rounded-sm bg-green-400 border border-gray-200"></div>
              <div className="w-3 h-3 rounded-sm bg-green-500 border border-gray-200"></div>
            </div>
            <span>多</span>
          </div>
        </div>
      </div>
    </div>
  )
}
