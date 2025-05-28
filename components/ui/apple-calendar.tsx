"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { getEmotionColor, getEmotionName } from "@/lib/emotion-utils"

interface CalendarDay {
  date: string
  day: number
  isToday: boolean
  isCurrentMonth: boolean
  emotion?: string
}

interface AppleCalendarProps {
  emotionRecords: Record<string, any>
  onDateSelect: (date: string) => void
  selectedDate?: string
}

export function AppleCalendar({ emotionRecords, onDateSelect, selectedDate }: AppleCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const getDaysInMonth = (date: Date): CalendarDay[] => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: CalendarDay[] = []
    const today = new Date()
    const todayString = today.toISOString().split('T')[0]

    // 上个月的日期（填充开头）
    const prevMonth = new Date(year, month - 1, 0)
    const prevMonthDays = prevMonth.getDate()
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthDays - i
      const dateString = new Date(year, month - 1, day).toISOString().split('T')[0]
      days.push({
        date: dateString,
        day,
        isToday: false,
        isCurrentMonth: false,
        emotion: emotionRecords[dateString]?.emotion,
      })
    }

    // 当前月的日期
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = new Date(year, month, day).toISOString().split('T')[0]
      days.push({
        date: dateString,
        day,
        isToday: dateString === todayString,
        isCurrentMonth: true,
        emotion: emotionRecords[dateString]?.emotion,
      })
    }

    // 下个月的日期（填充末尾）
    const remainingDays = 42 - days.length // 6周 * 7天
    for (let day = 1; day <= remainingDays; day++) {
      const dateString = new Date(year, month + 1, day).toISOString().split('T')[0]
      days.push({
        date: dateString,
        day,
        isToday: false,
        isCurrentMonth: false,
        emotion: emotionRecords[dateString]?.emotion,
      })
    }

    return days
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const days = getDaysInMonth(currentDate)
  const weekDays = ['日', '一', '二', '三', '四', '五', '六']

  return (
    <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4">
        <div className="flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigateMonth('prev')}
            className="p-2 rounded-full hover:bg-white/50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </motion.button>
          
          <h2 className="text-xl font-semibold text-gray-800">
            {currentDate.toLocaleDateString('zh-CN', { 
              year: 'numeric', 
              month: 'long' 
            })}
          </h2>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigateMonth('next')}
            className="p-2 rounded-full hover:bg-white/50 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </motion.button>
        </div>
      </div>

      {/* 星期标题 */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {weekDays.map((weekDay) => (
          <div 
            key={weekDay} 
            className="p-4 text-center text-sm font-medium text-gray-500 bg-gray-50"
          >
            {weekDay}
          </div>
        ))}
      </div>

      {/* 日期网格 */}
      <div className="grid grid-cols-7">
        {days.map((day, index) => (
          <motion.button
            key={`${day.date}-${index}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.01 }}
            whileHover={{ scale: 1.05, backgroundColor: "rgba(59, 130, 246, 0.05)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDateSelect(day.date)}
            className={`
              relative h-16 border border-gray-50 transition-all duration-200 group
              ${!day.isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
              ${day.isToday ? 'bg-blue-50 border-blue-200' : ''}
              ${selectedDate === day.date ? 'bg-blue-100 border-blue-300' : ''}
              hover:border-blue-200
            `}
          >
            {/* 日期数字 */}
            <div className={`
              text-sm font-medium
              ${day.isToday ? 'text-blue-600 font-bold' : ''}
              ${selectedDate === day.date ? 'text-blue-700 font-bold' : ''}
            `}>
              {day.day}
            </div>

            {/* 情绪指示器 */}
            {day.emotion && (
              <>
                <div 
                  className={`
                    absolute bottom-1 left-1/2 transform -translate-x-1/2 
                    w-6 h-6 rounded-full shadow-sm
                    ${getEmotionColor(day.emotion)}
                    transition-all duration-200 group-hover:scale-110
                  `}
                />
                {/* 悬停时显示情绪名称 */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 
                               opacity-0 group-hover:opacity-100 transition-opacity duration-200
                               bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                  {getEmotionName(day.emotion)}
                </div>
              </>
            )}

            {/* 今天的特殊标记 */}
            {day.isToday && (
              <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
            )}

            {/* 选中状态的边框动画 */}
            {selectedDate === day.date && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute inset-0 border-2 border-blue-400 rounded-lg pointer-events-none"
              />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
