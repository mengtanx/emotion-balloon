"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, MessageCircle, Calendar, Clock, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getEmotionName, getConversationsByDate, EmotionConversation } from "@/lib/emotion-utils"

interface EmotionDetailSidebarProps {
  selectedDate: string | null
  onClose: () => void
}

export function EmotionDetailSidebar({ selectedDate, onClose }: EmotionDetailSidebarProps) {
  if (!selectedDate) return null

  const conversations = getConversationsByDate(selectedDate)
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 border-l border-gray-200"
      >
        <div className="flex flex-col h-full">
          {/* 头部 */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                情绪记录
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="rounded-full hover:bg-white/50"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-gray-600 text-sm">
              {formatDate(selectedDate)}
            </p>
          </div>

          {/* 内容区域 */}
          <ScrollArea className="flex-1">
            <div className="p-6">
              {conversations.length > 0 ? (
                <div className="space-y-6">
                  {conversations.map((conversation) => (
                    <motion.div
                      key={conversation.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-50 rounded-2xl p-4 space-y-4"
                    >
                      {/* 对话头部 */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                            <MessageCircle className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              {getEmotionName(conversation.emotion)} 对话
                            </p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTime(conversation.createdAt)}
                            </p>
                          </div>
                        </div>
                        {conversation.isReleased && (
                          <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            <CheckCircle className="w-3 h-3" />
                            <span className="text-xs font-medium">已释放</span>
                          </div>
                        )}
                      </div>

                      {/* 对话消息 */}
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {conversation.messages.map((message, index) => (
                          <div
                            key={index}
                            className={`flex ${
                              message.type === 'user' ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div
                              className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                                message.type === 'user'
                                  ? 'bg-blue-500 text-white rounded-br-none'
                                  : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                              }`}
                            >
                              <p className="leading-relaxed">{message.content}</p>
                              <p className="text-xs mt-1 opacity-70">
                                {formatTime(message.timestamp)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* 对话统计 */}
                      <div className="border-t border-gray-200 pt-3 flex items-center justify-between text-xs text-gray-500">
                        <span>{conversation.messages.length} 条消息</span>
                        <span>
                          最后更新: {formatTime(conversation.updatedAt)}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <MessageCircle className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-600 mb-2">这一天还没有记录</h3>
                  <p className="text-gray-500 text-sm mb-6">
                    在这个日期还没有情绪记录或对话
                  </p>
                  <Button
                    onClick={onClose}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                  >
                    开始记录情绪
                  </Button>
                </motion.div>
              )}
            </div>
          </ScrollArea>

          {/* 底部操作 */}
          {conversations.length > 0 && (
            <div className="border-t border-gray-200 p-4">
              <p className="text-xs text-gray-500 text-center">
                共有 {conversations.length} 个情绪对话记录
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* 背景遮罩 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/20 z-40"
      />
    </AnimatePresence>
  )
} 