"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Send, Loader2, MessageCircle, CheckCircle, RotateCcw, Calendar } from "lucide-react"
import Link from "next/link"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Typewriter } from "@/components/ui/typewriter"
import { CustomEmotionManager } from "@/components/custom-emotion-manager"
import { 
  getEmotionTypes, 
  EmotionConversation, 
  ConversationMessage, 
  saveEmotionConversation,
  generateConversationId 
} from "@/lib/emotion-utils"
import { createDateTimeISO } from "@/lib/date-utils"

export default function ReleasePage() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  
  // 在客户端获取搜索参数，避免 Suspense 问题
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const date = urlParams.get('date')
      setSelectedDate(date)
    }
  }, [])
  
  const [emotionTypes, setEmotionTypes] = useState(getEmotionTypes())
  const [selectedEmotion, setSelectedEmotion] = useState("")
  const [emotionText, setEmotionText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [conversation, setConversation] = useState<EmotionConversation | null>(null)
  const [currentAiResponse, setCurrentAiResponse] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showReleaseOptions, setShowReleaseOptions] = useState(false)
  const [hasSelectedEmotion, setHasSelectedEmotion] = useState(false)
  const [showBalloonAnimation, setShowBalloonAnimation] = useState(false)
  const [balloonReleased, setBalloonReleased] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [conversation?.messages, currentAiResponse])

  const refreshEmotionTypes = () => {
    setEmotionTypes(getEmotionTypes())
  }

  // 获取用于创建对话的日期
  const getConversationDate = () => {
    if (selectedDate) {
      // 使用统一的日期时间创建函数，避免时区问题
      return createDateTimeISO(selectedDate)
    }
    // 否则使用当前时间
    return new Date().toISOString()
  }

  const startConversation = () => {
    if (!selectedEmotion || !emotionText.trim()) return

    const conversationDate = getConversationDate()

    const newConversation: EmotionConversation = {
      id: generateConversationId(),
      emotion: selectedEmotion,
      messages: [
        {
          type: 'user',
          content: emotionText,
          timestamp: conversationDate,
        }
      ],
      isReleased: false,
      createdAt: conversationDate,
      updatedAt: conversationDate,
    }

    setConversation(newConversation)
    setHasSelectedEmotion(true)
    setEmotionText("")
    sendMessageToAI(newConversation)
  }

  const sendMessage = () => {
    if (!emotionText.trim() || !conversation) return

    const userMessage: ConversationMessage = {
      type: 'user',
      content: emotionText,
      timestamp: new Date().toISOString(),
    }

    const updatedConversation = {
      ...conversation,
      messages: [...conversation.messages, userMessage],
      updatedAt: new Date().toISOString(),
    }

    setConversation(updatedConversation)
    setEmotionText("")
    sendMessageToAI(updatedConversation)
  }

  const sendMessageToAI = async (conv: EmotionConversation) => {
    setIsLoading(true)
    setCurrentAiResponse("")
    setIsTyping(true)

    try {
      const response = await fetch("/api/ai-comfort", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emotion: conv.emotion,
          text: conv.messages[conv.messages.length - 1].content,
          conversationHistory: conv.messages.slice(0, -1),
        }),
      })

      if (!response.ok) {
        throw new Error("API request failed")
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error("Failed to get response reader")
      }

      let fullResponse = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                fullResponse += parsed.content
                setCurrentAiResponse(fullResponse)
              }
            } catch (error) {
              // Skip invalid JSON
            }
          }
        }
      }

      // 添加AI响应到对话
      const aiMessage: ConversationMessage = {
        type: 'ai',
        content: fullResponse,
        timestamp: new Date().toISOString(),
      }

      const finalConversation = {
        ...conv,
        messages: [...conv.messages, aiMessage],
        updatedAt: new Date().toISOString(),
      }

      setConversation(finalConversation)
      saveEmotionConversation(finalConversation)
      setShowReleaseOptions(true)

    } catch (error) {
      console.error("Error calling AI API:", error)
      const errorMessage = "抱歉，暂时无法获取回复。但请记住，你的感受是被理解和接纳的。"
      setCurrentAiResponse(errorMessage)
      
      const aiMessage: ConversationMessage = {
        type: 'ai',
        content: errorMessage,
        timestamp: new Date().toISOString(),
      }

      const finalConversation = {
        ...conv,
        messages: [...conv.messages, aiMessage],
        updatedAt: new Date().toISOString(),
      }

      setConversation(finalConversation)
      saveEmotionConversation(finalConversation)
      setShowReleaseOptions(true)
    } finally {
      setIsLoading(false)
      setIsTyping(false)
    }
  }

  const releaseBalloon = () => {
    if (!conversation) return

    // 启动气球动画
    setShowBalloonAnimation(true)
    setShowReleaseOptions(false)

    // 动画完成后更新状态
    setTimeout(() => {
      const releasedConversation = {
        ...conversation,
        isReleased: true,
        updatedAt: new Date().toISOString(),
      }

      setConversation(releasedConversation)
      saveEmotionConversation(releasedConversation)
      setBalloonReleased(true)
      setShowBalloonAnimation(false)
    }, 4000) // 调整为4秒，匹配新的动画时长
  }

  const resetConversation = () => {
    setConversation(null)
    setCurrentAiResponse("")
    setShowReleaseOptions(false)
    setHasSelectedEmotion(false)
    setShowBalloonAnimation(false)
    setBalloonReleased(false)
    setSelectedEmotion("")
  }

  return (
    <>
      <style jsx>{`
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 relative overflow-hidden">
        {/* Balloon Release Animation */}
        <AnimatePresence>
          {showBalloonAnimation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 pointer-events-none bg-gradient-to-b from-blue-100/20 to-transparent"
            >
              {/* 气球动画 */}
              <motion.div
                initial={{ 
                  x: "50%", 
                  y: "calc(100vh - 120px)", 
                  scale: 1,
                  rotate: 0
                }}
                animate={{ 
                  x: "50%",
                  y: "30vh", // 飘到页面中间偏上位置
                  scale: [1, 1.2, 1.1],
                  rotate: [0, -5, 5, -3, 3, 0]
                }}
                transition={{ 
                  duration: 2.0,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
                className="absolute left-1/2 transform -translate-x-1/2"
              >
                <div
                  className={`w-32 h-40 bg-gradient-to-b ${
                    emotionTypes.find(e => e.value === selectedEmotion)?.color
                  } rounded-full shadow-2xl relative`}
                  style={{
                    borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%'
                  }}
                >
                  {/* 气球线 */}
                  <div className="w-1 h-20 bg-gray-600 mx-auto absolute -bottom-20 left-1/2 transform -translate-x-1/2"></div>
                  
                  {/* 气球高光 */}
                  <div className="absolute top-6 left-8 w-4 h-6 bg-white/50 rounded-full blur-sm"></div>
                  <div className="absolute top-8 left-6 w-2 h-3 bg-white/30 rounded-full"></div>
                  
                  {/* 爆炸效果 - 在气球到达目标位置后触发 */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                      opacity: [0, 0, 1, 0.8, 0], 
                      scale: [0, 0, 1.5, 3, 5] 
                    }}
                    transition={{ 
                      delay: 2.0, 
                      duration: 1.0, 
                      times: [0, 0.4, 0.5, 0.8, 1],
                      ease: "easeOut" 
                    }}
                    className="absolute inset-0 bg-gradient-radial from-yellow-300 via-orange-300 to-red-300 rounded-full opacity-80"
                  />
                  
                  {/* 第二层爆炸效果 */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                      opacity: [0, 0, 0.8, 0.6, 0], 
                      scale: [0, 0, 2, 4, 6] 
                    }}
                    transition={{ 
                      delay: 2.1, 
                      duration: 0.8, 
                      ease: "easeOut" 
                    }}
                    className="absolute inset-0 bg-gradient-radial from-pink-300 via-purple-300 to-blue-300 rounded-full opacity-60"
                  />
                  
                  {/* 闪光效果 */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0, 1, 0] }}
                    transition={{ delay: 2.0, duration: 0.4 }}
                    className="absolute inset-0 bg-white rounded-full"
                  />
                </div>
              </motion.div>

              {/* 撒花粒子效果 - 从爆炸中心向四周散开 */}
              {[...Array(25)].map((_, i) => {
                const angle = (i / 25) * 360;
                const distance = 150 + Math.random() * 100;
                const endX = Math.cos(angle * Math.PI / 180) * distance;
                const endY = Math.sin(angle * Math.PI / 180) * distance;
                
                return (
                  <motion.div
                    key={i}
                    initial={{ 
                      x: 0, 
                      y: 0, 
                      scale: 0,
                      opacity: 0,
                      rotate: 0
                    }}
                    animate={{ 
                      x: endX,
                      y: endY,
                      scale: [0, 0, 1.2, 0.8, 0],
                      opacity: [0, 0, 1, 0.8, 0],
                      rotate: Math.random() * 720
                    }}
                    transition={{ 
                      delay: 2.0 + i * 0.02,
                      duration: 1.5,
                      ease: "easeOut"
                    }}
                    className={`absolute w-3 h-3 ${
                      i % 5 === 0 ? 'bg-yellow-400' : 
                      i % 5 === 1 ? 'bg-pink-400' : 
                      i % 5 === 2 ? 'bg-purple-400' :
                      i % 5 === 3 ? 'bg-blue-400' : 'bg-green-400'
                    } rounded-full shadow-lg`}
                    style={{
                      left: '50%',
                      top: '30vh',
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                );
              })}

              {/* 额外的星星撒花效果 */}
              {[...Array(15)].map((_, i) => {
                const angle = (i / 15) * 360 + 180;
                const distance = 100 + Math.random() * 80;
                const endX = Math.cos(angle * Math.PI / 180) * distance;
                const endY = Math.sin(angle * Math.PI / 180) * distance;
                
                return (
                  <motion.div
                    key={`star-${i}`}
                    initial={{ 
                      x: "50%", 
                      y: "30vh", 
                      scale: 0,
                      opacity: 0,
                      rotate: 0
                    }}
                    animate={{ 
                      x: endX,
                      y: endY,
                      scale: [0, 0, 1, 0.6, 0],
                      opacity: [0, 0, 1, 0.7, 0],
                      rotate: Math.random() * 360
                    }}
                    transition={{ 
                      delay: 2.1 + i * 0.03,
                      duration: 1.8,
                      ease: "easeOut"
                    }}
                    className="absolute text-yellow-400 text-lg"
                    style={{
                      left: '50%',
                      top: '30vh',
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    ⭐
                  </motion.div>
                );
              })}

              {/* 彩带效果 */}
              {[...Array(8)].map((_, i) => {
                const angle = (i / 8) * 360;
                const distance = 120;
                const endX = Math.cos(angle * Math.PI / 180) * distance;
                const endY = Math.sin(angle * Math.PI / 180) * distance;
                
                return (
                  <motion.div
                    key={`ribbon-${i}`}
                    initial={{ 
                      x: 0,
                      y: 0,
                      scaleX: 0,
                      scaleY: 0,
                      opacity: 0,
                      rotate: angle
                    }}
                    animate={{ 
                      x: endX,
                      y: endY,
                      scaleX: [0, 0, 1, 0.8, 0],
                      scaleY: [0, 0, 3, 2, 0],
                      opacity: [0, 0, 0.8, 0.6, 0],
                      rotate: angle + 180
                    }}
                    transition={{ 
                      delay: 2.05 + i * 0.05,
                      duration: 1.2,
                      ease: "easeOut"
                    }}
                    className={`absolute w-1 h-8 ${
                      i % 4 === 0 ? 'bg-gradient-to-b from-red-400 to-pink-400' : 
                      i % 4 === 1 ? 'bg-gradient-to-b from-blue-400 to-purple-400' : 
                      i % 4 === 2 ? 'bg-gradient-to-b from-green-400 to-teal-400' :
                      'bg-gradient-to-b from-yellow-400 to-orange-400'
                    } rounded-full`}
                    style={{
                      left: '50%',
                      top: '30vh',
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                );
              })}

              {/* 文字提示 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ delay: 0.5 }}
                className="absolute top-1/4 left-1/2 transform -translate-x-1/2 text-center"
              >
                <motion.h2
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="text-3xl font-bold text-gray-700 mb-2"
                >
                  情绪正在释放...
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="text-gray-500 text-lg"
                >
                  让它飘向天空，拥抱内心的平静
                </motion.p>
              </motion.div>

              {/* 释放完成提示 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 3.2 }}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.3, 1] }}
                  transition={{ delay: 3.2, duration: 0.6 }}
                  className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg"
                >
                  <CheckCircle className="w-10 h-10 text-white" />
                </motion.div>
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 3.4 }}
                  className="text-2xl font-semibold text-gray-700 mb-2"
                >
                  释放成功！
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 3.6 }}
                  className="text-gray-600"
                >
                  你的情绪已经得到释放 🎉
                </motion.p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="p-6 flex items-center justify-end">
          {conversation && (
            <Button
              onClick={resetConversation}
              variant="outline"
              size="sm"
              className="text-gray-600 hover:text-gray-800"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              重新开始
            </Button>
          )}
        </div>

        <div className="container mx-auto px-6 py-8">
          <AnimatePresence mode="wait">
            {!hasSelectedEmotion ? (
              <motion.div
                key="emotion-selection"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-2xl mx-auto"
              >
                <div className="text-center mb-8">
                  <h1 className="text-4xl font-bold text-gray-800 mb-4">释放你的情绪</h1>
                  <p className="text-gray-600">选择一个代表你当前情绪的气球，然后告诉我你的感受</p>
                  {selectedDate && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-blue-700 text-sm flex items-center justify-center gap-2">
                        <Calendar className="w-4 h-4" />
                        正在为 {new Date(selectedDate).toLocaleDateString('zh-CN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          weekday: 'long'
                        })} 记录情绪
                      </p>
                    </div>
                  )}
                </div>

                {/* 情绪气球选择 */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg mb-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-800">选择你的情绪气球</h3>
                    <CustomEmotionManager onEmotionAdded={refreshEmotionTypes} />
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {emotionTypes.map((emotion) => (
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
                          className={`w-16 h-20 bg-gradient-to-b ${emotion.color} rounded-full mx-auto mb-2 shadow-lg relative overflow-hidden`}
                        >
                          <div className="w-2 h-8 bg-gray-400 mx-auto absolute bottom-0 left-1/2 transform -translate-x-1/2"></div>
                          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white/50 rounded-full"></div>
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

                {/* 开始对话按钮 */}
                <div className="text-center">
                  <Button
                    onClick={startConversation}
                    disabled={!selectedEmotion || !emotionText.trim()}
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-12 py-6 text-xl rounded-full shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                  >
                    开始对话
                    <MessageCircle className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="conversation"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-4xl mx-auto"
              >
                {/* 选中的情绪显示 */}
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <div
                      className={`w-8 h-10 bg-gradient-to-b ${
                        emotionTypes.find(e => e.value === selectedEmotion)?.color
                      } rounded-full shadow-lg relative overflow-hidden`}
                    >
                      <div className="w-1 h-4 bg-gray-400 mx-auto absolute bottom-0 left-1/2 transform -translate-x-1/2"></div>
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-800">
                      {emotionTypes.find(e => e.value === selectedEmotion)?.name} 对话
                    </h2>
                  </div>
                  {conversation?.isReleased && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-green-600 font-medium flex items-center justify-center gap-2"
                    >
                      🎈 气球已释放 - 情绪已得到释放，愿你内心平静
                    </motion.p>
                  )}
                </div>

                {/* 对话区域 */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg mb-6 max-h-96 overflow-y-auto">
                  <div className="p-6 space-y-4">
                    {conversation?.messages.map((message, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                            message.type === 'user'
                              ? 'bg-blue-500 text-white rounded-br-none'
                              : 'bg-gray-100 text-gray-800 rounded-bl-none'
                          }`}
                        >
                          {message.type === 'ai' ? (
                            <div className="text-sm leading-relaxed prose prose-sm max-w-none">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                            </div>
                          ) : (
                            <p className="text-sm leading-relaxed">{message.content}</p>
                          )}
                          <p className="text-xs mt-1 opacity-70">
                            {new Date(message.timestamp).toLocaleTimeString('zh-CN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </motion.div>
                    ))}

                    {/* 实时显示AI回复 */}
                    {isTyping && currentAiResponse && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                      >
                        <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-lg bg-gray-100 text-gray-800 rounded-bl-none">
                          <div className="text-sm leading-relaxed">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{currentAiResponse}</ReactMarkdown>
                            <span className="animate-pulse">|</span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* 加载指示器 */}
                    {isLoading && !currentAiResponse && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                      >
                        <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-lg bg-gray-100 text-gray-800 rounded-bl-none">
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm">心灵伙伴正在思考...</span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* 释放选项 */}
                {showReleaseOptions && !conversation?.isReleased && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg mb-6"
                  >
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                      你想要释放这个情绪气球吗？
                    </h3>
                    <div className="flex gap-4 justify-center">
                      <Button
                        onClick={releaseBalloon}
                        className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        释放气球
                      </Button>
                      <Button
                        onClick={() => setShowReleaseOptions(false)}
                        variant="outline"
                      >
                        继续对话
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* 消息输入区域 */}
                {!conversation?.isReleased && (
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                    <div className="flex gap-4">
                      <Textarea
                        value={emotionText}
                        onChange={(e) => setEmotionText(e.target.value)}
                        placeholder="继续分享你的感受..."
                        className="flex-1 min-h-16 resize-none border-0 bg-white/50 focus:bg-white/80 transition-all duration-300"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            sendMessage()
                          }
                        }}
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={!emotionText.trim() || isLoading}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* 释放完成后的操作 */}
                {conversation?.isReleased && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg text-center"
                  >
                    <div className="mb-6">
                      <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                        情绪释放完成
                      </h3>
                      <p className="text-gray-600 mb-4">
                        你的情绪已经随着气球飘向天空。记住，每一种情绪都有它存在的意义，
                        感谢你愿意面对和释放它们。
                      </p>
                      <p className="text-sm text-gray-500">
                        你可以随时回来记录新的情绪，我们永远在这里陪伴你。
                      </p>
                    </div>
                    
                    <div className="flex gap-4 justify-center">
                      <Button
                        onClick={resetConversation}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        重新开始
                      </Button>
                      <Link href="/records">
                        <Button variant="outline">
                          <Calendar className="w-4 h-4 mr-2" />
                          查看记录
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  )
}
