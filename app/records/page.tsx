"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus, Calendar, TrendingUp, MessageCircle, RotateCcw } from "lucide-react"
import Link from "next/link"
import { AppleCalendar } from "@/components/ui/apple-calendar"
import { EmotionDetailSidebar } from "@/components/emotion-detail-sidebar"
import { CustomEmotionManager } from "@/components/custom-emotion-manager"
import { 
  getEmotionConversations, 
  getEmotionTypes, 
  getEmotionName,
  getEmotionColor 
} from "@/lib/emotion-utils"
import { extractDateFromISO } from "@/lib/date-utils"

export default function RecordsPage() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [emotionRecords, setEmotionRecords] = useState<Record<string, any>>({})
  const [emotionTypes, setEmotionTypes] = useState(getEmotionTypes())
  const [showSidebar, setShowSidebar] = useState(false)

  // Function to refresh emotion records data
  const refreshEmotionRecords = () => {
    const conversations = getEmotionConversations()
    const records: Record<string, any> = {}
    
    conversations.forEach(conversation => {
      // 使用统一的日期提取函数
      const date = extractDateFromISO(conversation.createdAt)
      if (!records[date]) {
        records[date] = {
          conversations: [conversation],
          emotions: [conversation.emotion]
        }
      } else {
        records[date].conversations.push(conversation)
        records[date].emotions.push(conversation.emotion)
      }
    })

    setEmotionRecords(records)
  }

  useEffect(() => {
    // Initial load of emotion records
    refreshEmotionRecords()

    // Add focus event listener to refresh data when user returns to the page
    const handleFocus = () => {
      refreshEmotionRecords()
    }

    // Add visibility change listener to refresh when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshEmotionRecords()
      }
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup event listeners
    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const refreshEmotionTypes = () => {
    setEmotionTypes(getEmotionTypes())
  }

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    
    // If the date has existing emotion records, show the sidebar
    if (emotionRecords[date] && emotionRecords[date].conversations.length > 0) {
      setShowSidebar(true)
    } else {
      // If no records exist for this date, show the sidebar with option to create new record
      setShowSidebar(true)
    }
  }

  const closeSidebar = () => {
    setShowSidebar(false)
    setSelectedDate(null)
  }

  // Calculate statistics from emotion records state for consistency
  const { totalConversations, releasedCount, uniqueDays, recentEmotions } = useMemo(() => {
    const allConversations = Object.values(emotionRecords).flatMap(record => record.conversations || [])
    
    return {
      totalConversations: allConversations.length,
      releasedCount: allConversations.filter(c => c.isReleased).length,
      uniqueDays: Object.keys(emotionRecords).length,
      recentEmotions: allConversations
        .slice(-7)
        .map(c => ({ emotion: c.emotion, date: c.createdAt.split('T')[0] }))
    }
  }, [emotionRecords])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100">
      {/* Header */}
      <div className="p-6 flex items-center justify-end">
        <div className="flex gap-3">
          <Button
            onClick={refreshEmotionRecords}
            variant="outline"
            size="sm"
            className="text-gray-600 hover:text-gray-800"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            刷新记录
          </Button>
          <CustomEmotionManager onEmotionAdded={refreshEmotionTypes} />
          <Link href="/release">
            <Button
              size="sm"
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              记录情绪
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">情绪记录</h1>
            <p className="text-gray-600">追踪你的情绪历程，了解自己的情绪模式</p>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{totalConversations}</p>
                  <p className="text-gray-600 text-sm">总对话数</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{uniqueDays}</p>
                  <p className="text-gray-600 text-sm">记录天数</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{releasedCount}</p>
                  <p className="text-gray-600 text-sm">已释放气球</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* 日历组件 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-6">
                <Calendar className="w-5 h-5 text-gray-600" />
                <h3 className="text-xl font-semibold text-gray-800">情绪日历</h3>
                <span className="text-sm text-gray-500 ml-auto">点击日期查看详细记录</span>
              </div>
              
              <AppleCalendar
                emotionRecords={emotionRecords}
                onDateSelect={handleDateSelect}
                selectedDate={selectedDate ?? undefined}
              />
            </div>
          </motion.div>

          {/* 情绪图例 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg mb-8"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">情绪图例</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {emotionTypes.map((emotion) => (
                <div key={emotion.value} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${emotion.color}`}></div>
                  <span className="text-sm text-gray-700">{emotion.name}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* 最近趋势 */}
          {recentEmotions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                最近情绪趋势
              </h3>
              <div className="flex flex-wrap gap-2">
                {recentEmotions.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg"
                  >
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${emotionTypes.find(e => e.value === item.emotion)?.color || 'from-gray-400 to-gray-600'}`}></div>
                    <span className="text-sm text-gray-600">{getEmotionName(item.emotion)}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(item.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* 空状态 */}
          {totalConversations === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">还没有情绪记录</h3>
              <p className="text-gray-500 mb-6">开始记录你的情绪，了解自己的情绪模式</p>
              <Link href="/release">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white">
                  开始记录
                </Button>
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* 侧边栏 */}
      {showSidebar && selectedDate && (
        <EmotionDetailSidebar
          selectedDate={selectedDate}
          onClose={closeSidebar}
        />
      )}
    </div>
  )
}
