"use client"

import { motion } from "framer-motion"
import { getEmotionConversations, getEmotionColor } from "@/lib/emotion-utils"

interface EmotionHeatmapProps {
  className?: string
}

export function EmotionHeatmap({ className = "" }: EmotionHeatmapProps) {
  // 获取过去52周的日期数据（365天）
  const getWeeksData = () => {
    const weeks = []
    // 使用固定的基准日期 2025-05-28
    const baseDate = new Date('2025-05-28')
    
    // 找到baseDate是星期几 (0=Sunday, 1=Monday, ..., 6=Saturday)
    const baseDayOfWeek = baseDate.getDay()
    const daysFromSunday = baseDayOfWeek === 0 ? 0 : baseDayOfWeek
    
    // 计算从哪个日期开始（确保从周日开始）
    const startDate = new Date(baseDate)
    startDate.setDate(startDate.getDate() - daysFromSunday - (52 * 7 - 1))
    
    // 生成53周的数据以确保覆盖365天
    for (let weekIndex = 0; weekIndex < 53; weekIndex++) {
      const week = []
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + (weekIndex * 7 + dayIndex))
        
        // 只添加在基准日期365天范围内的日期
        const daysDiff = Math.floor((baseDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
        if (daysDiff >= 0 && daysDiff < 365) {
          week.push(date.toISOString().split('T')[0])
        } else if (daysDiff < 0) {
          // 如果超过基准日期，用空字符串占位但不显示
          week.push('')
        }
      }
      
      // 如果这一周有任何有效日期，就添加到weeks中
      if (week.some(day => day !== '')) {
        weeks.push(week)
      }
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
    if (!date) {
      return { 
        intensity: 0, 
        style: { backgroundColor: 'transparent' }, 
        hoverStyle: { backgroundColor: 'transparent' },
        tooltip: '' 
      }
    }
    
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
    if (!date) return ''
    return new Date(date).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric'
    })
  }

  const weeksData = getWeeksData()
  
  // 生成月份标签 - 基于实际的周数据
  const getMonthLabels = () => {
    const labels = []
    const monthPositions = []
    
    // 遍历所有周，记录每个月第一次出现的位置
    const monthFirstWeek = new Map()
    
    weeksData.forEach((week, weekIndex) => {
      week.forEach(date => {
        if (date) {
          const month = new Date(date).getMonth()
          if (!monthFirstWeek.has(month)) {
            monthFirstWeek.set(month, weekIndex)
          }
        }
      })
    })
    
    // 根据基准日期生成最近12个月的标签
    const baseDate = new Date('2025-05-28')
    for (let i = 11; i >= 0; i--) {
      const month = new Date(baseDate)
      month.setMonth(month.getMonth() - i)
      const monthNum = month.getMonth()
      const weekPos = monthFirstWeek.get(monthNum)
      
      if (weekPos !== undefined) {
        labels.push({
          label: month.toLocaleDateString('zh-CN', { month: 'short' }),
          position: weekPos
        })
      }
    }
    
    return labels
  }

  const monthLabels = getMonthLabels()

  // 检查今天是否为基准日期
  const isToday = (date: string) => {
    return date === '2025-05-28'
  }

  return (
    <div className={`${className}`}>
      <div className="overflow-x-auto">
        {/* 月份标签 */}
        <div className="relative mb-2 ml-8" style={{ minWidth: `${weeksData.length * 16}px` }}>
          {monthLabels.map((monthInfo, i) => (
            <span 
              key={i} 
              className="absolute text-xs text-gray-500"
              style={{ left: `${monthInfo.position * 16}px` }}
            >
              {monthInfo.label}
            </span>
          ))}
        </div>

        {/* 热力图网格容器 */}
        <div className="flex gap-1 min-w-max">
          {/* 周标签（左侧Y轴） */}
          <div className="flex flex-col gap-1 mr-2 justify-center">
            <div className="w-6 h-3 flex items-center">
              <span className="text-xs text-gray-500">周一</span>
            </div>
            <div className="w-6 h-3"></div>
            <div className="w-6 h-3 flex items-center">
              <span className="text-xs text-gray-500">周三</span>
            </div>
            <div className="w-6 h-3"></div>
            <div className="w-6 h-3 flex items-center">
              <span className="text-xs text-gray-500">周五</span>
            </div>
            <div className="w-6 h-3"></div>
            <div className="w-6 h-3"></div>
          </div>

          {/* 热力图网格 */}
          <div className="flex gap-1">
            {weeksData.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((date, dayIndex) => {
                  if (!date) {
                    return <div key={`empty-${weekIndex}-${dayIndex}`} className="w-3 h-3" />
                  }
                  
                  const { style, hoverStyle, tooltip } = getDateInfo(date)
                  const isTodayDate = isToday(date)
                  
                  return (
                    <motion.div
                      key={date}
                      className={`w-3 h-3 rounded-sm border border-gray-200 cursor-pointer transition-all duration-200 ${
                        isTodayDate ? 'ring-2 ring-blue-400 ring-offset-1' : ''
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
        </div>
      </div>
    </div>
  )
}
