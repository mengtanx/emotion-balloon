"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, X, Palette } from "lucide-react"
import { EmotionType, getCustomEmotionTypes, addCustomEmotionType, removeCustomEmotionType } from "@/lib/emotion-utils"

const predefinedColors = [
  "from-pink-400 to-pink-600",
  "from-indigo-400 to-indigo-600",
  "from-teal-400 to-teal-600",
  "from-orange-400 to-orange-600",
  "from-cyan-400 to-cyan-600",
  "from-lime-400 to-lime-600",
  "from-amber-400 to-amber-600",
  "from-emerald-400 to-emerald-600",
]

interface CustomEmotionManagerProps {
  onEmotionAdded?: () => void
}

export function CustomEmotionManager({ onEmotionAdded }: CustomEmotionManagerProps) {
  const [customEmotions, setCustomEmotions] = useState<EmotionType[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [newEmotionName, setNewEmotionName] = useState("")
  const [selectedColor, setSelectedColor] = useState(predefinedColors[0])

  useEffect(() => {
    setCustomEmotions(getCustomEmotionTypes())
  }, [])

  const handleAddEmotion = () => {
    if (!newEmotionName.trim()) return

    const newEmotion: EmotionType = {
      name: newEmotionName.trim(),
      value: newEmotionName.trim().toLowerCase().replace(/\s+/g, '_'),
      color: selectedColor,
    }

    addCustomEmotionType(newEmotion)
    setCustomEmotions(prev => [...prev, newEmotion])
    setNewEmotionName("")
    setSelectedColor(predefinedColors[0])
    onEmotionAdded?.()
  }

  const handleRemoveEmotion = (value: string) => {
    removeCustomEmotionType(value)
    setCustomEmotions(prev => prev.filter(emotion => emotion.value !== value))
    onEmotionAdded?.()
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-dashed border-2 text-gray-500 hover:text-gray-700 hover:border-gray-400"
        >
          <Plus className="w-4 h-4 mr-2" />
          自定义情绪
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            管理自定义情绪
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* 添加新情绪 */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-800">添加新情绪</h4>
            
            <div className="space-y-3">
              <Input
                placeholder="输入情绪名称"
                value={newEmotionName}
                onChange={(e) => setNewEmotionName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddEmotion()}
              />
              
              <div className="space-y-2">
                <label className="text-sm text-gray-600">选择颜色</label>
                <div className="grid grid-cols-4 gap-2">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-12 h-8 bg-gradient-to-r ${color} rounded-md border-2 transition-all ${
                        selectedColor === color ? 'border-gray-800 scale-110' : 'border-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              <Button 
                onClick={handleAddEmotion}
                disabled={!newEmotionName.trim()}
                className="w-full"
              >
                添加情绪
              </Button>
            </div>
          </div>

          {/* 已有的自定义情绪 */}
          {customEmotions.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-800">已添加的情绪</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                <AnimatePresence>
                  {customEmotions.map((emotion) => (
                    <motion.div
                      key={emotion.value}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 bg-gradient-to-r ${emotion.color} rounded-full`} />
                        <span className="text-sm font-medium">{emotion.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveEmotion(emotion.value)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
