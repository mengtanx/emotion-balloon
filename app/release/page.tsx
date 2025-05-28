"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Send, Loader2 } from "lucide-react"
import Link from "next/link"

const emotionColors = [
  { name: "愤怒", color: "from-red-400 to-red-600", value: "anger" },
  { name: "悲伤", color: "from-blue-400 to-blue-600", value: "sadness" },
  { name: "焦虑", color: "from-yellow-400 to-orange-500", value: "anxiety" },
  { name: "快乐", color: "from-green-400 to-green-600", value: "happiness" },
  { name: "平静", color: "from-purple-400 to-purple-600", value: "calm" },
  { name: "困惑", color: "from-gray-400 to-gray-600", value: "confusion" },
]

export default function ReleasePage() {
  const [selectedEmotion, setSelectedEmotion] = useState("")
  const [emotionText, setEmotionText] = useState("")
  const [isReleasing, setIsReleasing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [aiResponse, setAiResponse] = useState("")
  const [showResponse, setShowResponse] = useState(false)

  const handleRelease = async () => {
    if (!selectedEmotion || !emotionText.trim()) return

    setIsReleasing(true)
    setIsLoading(true)

    // 保存情绪记录到 localStorage
    const today = new Date().toISOString().split("T")[0]
    const existingRecords = JSON.parse(localStorage.getItem("emotionRecords") || "{}")
    existingRecords[today] = {
      emotion: selectedEmotion,
      text: emotionText,
      timestamp: new Date().toISOString(),
    }
    localStorage.setItem("emotionRecords", JSON.stringify(existingRecords))

    try {
      // 调用 AI API
      const response = await fetch("/api/ai-comfort", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emotion: selectedEmotion,
          text: emotionText,
        }),
      })

      const data = await response.json()
      setAiResponse(data.response)

      // 延迟显示 AI 回复
      setTimeout(() => {
        setIsLoading(false)
        setShowResponse(true)
      }, 2000)
    } catch (error) {
      console.error("Error calling AI API:", error)
      setIsLoading(false)
      setAiResponse("抱歉，暂时无法获取回复，但你的情绪已经被记录下来了。请记住，每一种情绪都是有意义的。")
      setShowResponse(true)
    }
  }

  const resetForm = () => {
    setSelectedEmotion("")
    setEmotionText("")
    setIsReleasing(false)
    setShowResponse(false)
    setAiResponse("")
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100">
      {/* Header */}
      <div className="p-6 flex items-center">
        <Link href="/">
          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回首页
          </Button>
        </Link>
      </div>

      <div className="container mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {!isReleasing ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">释放你的情绪</h1>
                <p className="text-gray-600">选择一个代表你当前情绪的气球，然后告诉我你的感受</p>
              </div>

              {/* 情绪气球选择 */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">选择你的情绪气球</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {emotionColors.map((emotion) => (
                    <motion.button
                      key={emotion.value}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedEmotion(emotion.value)}
                      className={`relative p-4 rounded-xl transition-all duration-300 ${
                        selectedEmotion === emotion.value ? "ring-4 ring-blue-400 shadow-lg" : "hover:shadow-md"
                      }`}
                    >
                      <div
                        className={`w-16 h-20 bg-gradient-to-b ${emotion.color} rounded-full mx-auto mb-2 shadow-lg`}
                      >
                        <div className="w-2 h-8 bg-gray-400 mx-auto"></div>
                      </div>
                      <p className="text-sm font-medium text-gray-700">{emotion.name}</p>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* 情绪描述输入 */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">描述你的感受</h3>
                <Textarea
                  value={emotionText}
                  onChange={(e) => setEmotionText(e.target.value)}
                  placeholder="告诉我你现在的感受，不用担心，这里很安全..."
                  className="min-h-32 resize-none border-0 bg-white/50 focus:bg-white/80 transition-all duration-300"
                />
              </div>

              {/* 释放按钮 */}
              <div className="text-center">
                <Button
                  onClick={handleRelease}
                  disabled={!selectedEmotion || !emotionText.trim()}
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-12 py-6 text-xl rounded-full shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                >
                  释放气球
                  <Send className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="release"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-2xl mx-auto text-center"
            >
              {/* 气球释放动画 */}
              <div className="relative h-96 mb-8">
                <motion.div
                  initial={{ y: 0, scale: 1 }}
                  animate={{ y: -400, scale: 0.5 }}
                  transition={{ duration: 3, ease: "easeOut" }}
                  className={`w-24 h-30 bg-gradient-to-b ${
                    emotionColors.find((e) => e.value === selectedEmotion)?.color
                  } rounded-full mx-auto shadow-lg absolute left-1/2 transform -translate-x-1/2 bottom-0`}
                >
                  <div className="w-3 h-12 bg-gray-400 mx-auto"></div>
                </motion.div>
              </div>

              {isLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg"
                >
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">正在为你准备回复...</h3>
                  <p className="text-gray-600">请稍等，我正在仔细聆听你的情绪</p>
                </motion.div>
              ) : showResponse ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg"
                >
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">来自心灵的回应</h3>
                  <p className="text-gray-700 leading-relaxed mb-6">{aiResponse}</p>
                  <Button
                    onClick={resetForm}
                    className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
                  >
                    继续释放情绪
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg"
                >
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">气球已经飞走了</h3>
                  <p className="text-gray-600">你的情绪正在被温柔地释放...</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
