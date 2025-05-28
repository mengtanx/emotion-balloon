"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Send, Loader2, MessageCircle, CheckCircle, RotateCcw } from "lucide-react"
import Link from "next/link"
import { Typewriter } from "@/components/ui/typewriter"
import { CustomEmotionManager } from "@/components/custom-emotion-manager"
import { 
  getEmotionTypes, 
  EmotionConversation, 
  ConversationMessage, 
  saveEmotionConversation,
  generateConversationId 
} from "@/lib/emotion-utils"

export default function ReleasePage() {
  const [emotionTypes, setEmotionTypes] = useState(getEmotionTypes())
  const [selectedEmotion, setSelectedEmotion] = useState("")
  const [emotionText, setEmotionText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [conversation, setConversation] = useState<EmotionConversation | null>(null)
  const [currentAiResponse, setCurrentAiResponse] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showReleaseOptions, setShowReleaseOptions] = useState(false)
  const [hasSelectedEmotion, setHasSelectedEmotion] = useState(false)
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

  const startConversation = () => {
    if (!selectedEmotion || !emotionText.trim()) return

    const newConversation: EmotionConversation = {
      id: generateConversationId(),
      emotion: selectedEmotion,
      messages: [
        {
          type: 'user',
          content: emotionText,
          timestamp: new Date().toISOString(),
        }
      ],
      isReleased: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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

    const releasedConversation = {
      ...conversation,
      isReleased: true,
      updatedAt: new Date().toISOString(),
    }

    setConversation(releasedConversation)
    saveEmotionConversation(releasedConversation)
    setShowReleaseOptions(false)
  }

  const resetConversation = () => {
    setConversation(null)
    setCurrentAiResponse("")
    setSelectedEmotion("")
    setEmotionText("")
    setHasSelectedEmotion(false)
    setShowReleaseOptions(false)
    setIsTyping(false)
    setIsLoading(false)
  }

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
                    className="text-green-600 font-medium"
                  >
                    气球已释放 - 情绪已得到释放 🎈
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
                        <p className="text-sm leading-relaxed">{message.content}</p>
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
                          {currentAiResponse}
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
