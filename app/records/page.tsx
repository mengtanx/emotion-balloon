"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, Plus } from "lucide-react"
import Link from "next/link"

interface EmotionRecord {
  emotion: string
  text: string
  timestamp: string
}

const emotionColors: Record<string, string> = {
  anger: "bg-red-400",
  sadness: "bg-blue-400",
  anxiety: "bg-yellow-400",
  happiness: "bg-green-400",
  calm: "bg-purple-400",
  confusion: "bg-gray-400",
}

const emotionNames: Record<string, string> = {
  anger: "愤怒",
  sadness: "悲伤",
  anxiety: "焦虑",
  happiness: "快乐",
  calm: "平静",
  confusion: "困惑",
}

export default function RecordsPage() {
  const [records, setRecords] = useState<Record<string, EmotionRecord>>({})
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  useEffect(() => {
    const savedRecords = localStorage.getItem("emotionRecords")
    if (savedRecords) {
      setRecords(JSON.parse(savedRecords))
    }
  }, [])

  // 生成日历数据（最近30天）
  const generateCalendarDays = () => {
    const days = []
    const today = new Date()

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      const dateString = date.toISOString().split("T")[0]
      days.push({
        date: dateString,
        day: date.getDate(),
        isToday: i === 0,
        record: records[dateString],
      })
    }
    return days
  }

  const calendarDays = generateCalendarDays()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100">
      {/* Header */}
      <div className="p-6 flex items-center justify-between">
        <Link href="/">
          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回首页
          </Button>
        </Link>
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

      <div className="container mx-auto px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">情绪记录</h1>
            <p className="text-gray-600">追踪你的情绪历程，了解自己的情绪模式</p>
          </div>

          {/* 情绪日历 */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg mb-6">
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="w-5 h-5 text-gray-600" />
              <h3 className="text-xl font-semibold text-gray-800">最近30天的情绪记录</h3>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-4">
              {["日", "一", "二", "三", "四", "五", "六"].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, index) => (
                <motion.button
                  key={day.date}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.02 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setSelectedDate(day.date)}
                  className={`relative p-3 rounded-lg transition-all duration-200 ${
                    day.isToday ? "ring-2 ring-blue-400" : ""
                  } ${selectedDate === day.date ? "bg-blue-100" : "hover:bg-gray-100"}`}
                >
                  <div className="text-sm font-medium text-gray-700 mb-1">{day.day}</div>
                  {day.record && (
                    <div
                      className={`w-3 h-3 rounded-full mx-auto ${emotionColors[day.record.emotion] || "bg-gray-300"}`}
                    ></div>
                  )}
                </motion.button>
              ))}
            </div>

            {/* 情绪图例 */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-3">情绪图例：</p>
              <div className="flex flex-wrap gap-4">
                {Object.entries(emotionNames).map(([key, name]) => (
                  <div key={key} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${emotionColors[key]}`}></div>
                    <span className="text-sm text-gray-600">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 选中日期的详细信息 */}
          {selectedDate && records[selectedDate] && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                {new Date(selectedDate).toLocaleDateString("zh-CN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}{" "}
                的情绪记录
              </h3>

              <div className="flex items-center gap-3 mb-4">
                <div className={`w-6 h-6 rounded-full ${emotionColors[records[selectedDate].emotion]}`}></div>
                <span className="text-lg font-medium text-gray-700">{emotionNames[records[selectedDate].emotion]}</span>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed">{records[selectedDate].text}</p>
              </div>

              <p className="text-sm text-gray-500 mt-3">
                记录时间：{new Date(records[selectedDate].timestamp).toLocaleString("zh-CN")}
              </p>
            </motion.div>
          )}

          {/* 空状态 */}
          {Object.keys(records).length === 0 && (
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
    </div>
  )
}
