"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Heart, Calendar, Info, Sparkles } from "lucide-react"
import Link from "next/link"
import { EmotionHeatmap } from "@/components/ui/emotion-heatmap"

export default function HomePage() {
  const [showWelcome, setShowWelcome] = useState(true)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100">
      {/* Navigation */}
      <nav className="p-6 flex justify-between items-center">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
            <Heart className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-semibold text-gray-800">情绪气球</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-4">
          <Link href="/records">
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
              <Calendar className="w-4 h-4 mr-2" />
              情绪记录
            </Button>
          </Link>
          <Link href="/about">
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
              <Info className="w-4 h-4 mr-2" />
              关于
            </Button>
          </Link>
        </motion.div>
      </nav>

      {/* Welcome Animation */}
      {showWelcome && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 2, duration: 1 }}
          onAnimationComplete={() => setShowWelcome(false)}
          className="fixed inset-0 bg-gradient-to-br from-blue-200 to-purple-200 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">欢迎来到情绪气球</h1>
            <p className="text-gray-600">让我们一起释放情绪，拥抱美好</p>
          </motion.div>
        </motion.div>
      )}

      {/* Emotion Heatmap */}
      <div className="container mx-auto px-6 py-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-sm mb-6 border border-gray-200/50"
        >
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-gray-600" />
            <h3 className="text-sm font-medium text-gray-700">过去一年的情绪记录</h3>
          </div>
          <EmotionHeatmap />
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            释放你的情绪
            <span className="block text-3xl text-gray-600 mt-2">让心灵重获自由</span>
          </h1>

          <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            在这里，你可以安全地表达自己的情绪，通过虚拟气球释放内心的压力，
            并记录你的情绪历程。让我们陪伴你走过每一个情绪波动的时刻。
          </p>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-red-400 to-pink-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">情绪释放</h3>
              <p className="text-gray-600">选择代表你情绪的气球颜色，写下你的感受，然后释放它们</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">AI 陪伴</h3>
              <p className="text-gray-600">获得温暖的回应和专业的情绪引导，你不是一个人</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">情绪记录</h3>
              <p className="text-gray-600">追踪你的情绪变化，了解自己的情绪模式</p>
            </motion.div>
          </div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.3 }}
          >
            <Link href="/release">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-12 py-6 text-xl rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                开始释放情绪
                <Sparkles className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
