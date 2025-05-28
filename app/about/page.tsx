"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Heart, Target, Users, Shield } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mx-auto mb-6 flex items-center justify-center"
            >
              <Heart className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">关于情绪气球</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              一个温暖的数字空间，帮助你释放情绪、记录心情，陪伴你走过每一个情绪波动的时刻
            </p>
          </div>

          {/* 使命愿景 */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mb-4 flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">我们的使命</h3>
              <p className="text-gray-600 leading-relaxed">
                为每一个需要情绪支持的人提供一个安全、温暖的数字空间。
                我们相信，每一种情绪都有其存在的意义，每一个人都值得被理解和关爱。
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-400 rounded-full mb-4 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">我们的愿景</h3>
              <p className="text-gray-600 leading-relaxed">
                创建一个没有情绪负担的世界，让每个人都能自由地表达自己的感受，
                获得理解和支持，最终实现内心的平静与成长。
              </p>
            </motion.div>
          </div>

          {/* 功能特色 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg mb-12"
          >
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">我们提供什么</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-red-400 to-pink-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">情绪释放</h4>
                <p className="text-gray-600 text-sm">通过虚拟气球的形式，让你以一种温和的方式释放内心的情绪压力</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">AI 陪伴</h4>
                <p className="text-gray-600 text-sm">专业的 AI 情绪支持助手，为你提供个性化的理解、安慰和建议</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">情绪追踪</h4>
                <p className="text-gray-600 text-sm">记录和追踪你的情绪变化，帮助你更好地了解自己的情绪模式</p>
              </div>
            </div>
          </motion.div>

          {/* 隐私保护 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg mb-12"
          >
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-blue-500" />
              <h3 className="text-2xl font-semibold text-gray-800">隐私与安全</h3>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
              我们深知情绪数据的敏感性，因此采取了严格的隐私保护措施：
            </p>
            <ul className="text-gray-600 space-y-2">
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                <span>所有情绪记录仅存储在你的设备本地，我们不会收集或存储你的个人情绪数据</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                <span>AI 对话内容经过加密传输，且不会与你的个人身份关联</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                <span>你可以随时清除本地数据，完全控制自己的隐私</span>
              </li>
            </ul>
          </motion.div>

          {/* 行动号召 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2 }}
            className="text-center"
          >
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">开始你的情绪释放之旅</h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              无论你现在感受如何，请记住：你的情绪是有意义的，你的感受是被理解的。
              让我们陪伴你，一起走过每一个情绪的起伏。
            </p>
            <Link href="/release">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-12 py-6 text-xl rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                开始释放情绪
                <Heart className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
