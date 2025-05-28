export interface EmotionType {
  name: string
  color: string
  value: string
}

export interface EmotionRecord {
  emotion: string
  text: string
  timestamp: string
  aiResponses?: Array<{
    message: string
    timestamp: string
  }>
}

export interface ConversationMessage {
  type: 'user' | 'ai'
  content: string
  timestamp: string
}

export interface EmotionConversation {
  id: string
  emotion: string
  messages: ConversationMessage[]
  isReleased: boolean
  createdAt: string
  updatedAt: string
}

// 默认情绪类型
export const defaultEmotionTypes: EmotionType[] = [
  { name: "愤怒", color: "from-red-400 to-red-600", value: "anger" },
  { name: "悲伤", color: "from-blue-400 to-blue-600", value: "sadness" },
  { name: "焦虑", color: "from-amber-400 to-yellow-600", value: "anxiety" },
  { name: "快乐", color: "from-green-400 to-green-600", value: "happiness" },
  { name: "平静", color: "from-purple-400 to-purple-600", value: "calm" },
  { name: "困惑", color: "from-indigo-400 to-slate-600", value: "confusion" },
]

// 获取情绪类型（包括自定义的）
export function getEmotionTypes(): EmotionType[] {
  if (typeof window === 'undefined') return defaultEmotionTypes
  
  const customEmotions = localStorage.getItem('customEmotionTypes')
  const custom = customEmotions ? JSON.parse(customEmotions) : []
  return [...defaultEmotionTypes, ...custom]
}

// 添加自定义情绪类型
export function addCustomEmotionType(emotion: EmotionType): void {
  if (typeof window === 'undefined') return
  
  const customEmotions = getCustomEmotionTypes()
  customEmotions.push(emotion)
  localStorage.setItem('customEmotionTypes', JSON.stringify(customEmotions))
}

// 获取自定义情绪类型
export function getCustomEmotionTypes(): EmotionType[] {
  if (typeof window === 'undefined') return []
  
  const customEmotions = localStorage.getItem('customEmotionTypes')
  return customEmotions ? JSON.parse(customEmotions) : []
}

// 删除自定义情绪类型
export function removeCustomEmotionType(value: string): void {
  if (typeof window === 'undefined') return
  
  const customEmotions = getCustomEmotionTypes()
  const filtered = customEmotions.filter(emotion => emotion.value !== value)
  localStorage.setItem('customEmotionTypes', JSON.stringify(filtered))
}

// 情绪颜色映射（用于日历显示）
export function getEmotionColor(emotionValue: string): string {
  const emotionTypes = getEmotionTypes()
  const emotion = emotionTypes.find(e => e.value === emotionValue)
  
  if (!emotion) return 'bg-gray-300'
  
  // 从渐变色中提取第一个颜色作为背景色
  const colorMatch = emotion.color.match(/from-(\w+-\d+)/)
  return colorMatch ? `bg-${colorMatch[1]}` : 'bg-gray-300'
}

// 获取情绪名称
export function getEmotionName(emotionValue: string): string {
  const emotionTypes = getEmotionTypes()
  const emotion = emotionTypes.find(e => e.value === emotionValue)
  return emotion?.name || '未知情绪'
}

// 保存情绪对话
export function saveEmotionConversation(conversation: EmotionConversation): void {
  if (typeof window === 'undefined') return
  
  const conversations = getEmotionConversations()
  const existingIndex = conversations.findIndex(c => c.id === conversation.id)
  
  if (existingIndex >= 0) {
    conversations[existingIndex] = conversation
  } else {
    conversations.push(conversation)
  }
  
  localStorage.setItem('emotionConversations', JSON.stringify(conversations))
}

// 获取所有情绪对话
export function getEmotionConversations(): EmotionConversation[] {
  if (typeof window === 'undefined') return []
  
  const conversations = localStorage.getItem('emotionConversations')
  return conversations ? JSON.parse(conversations) : []
}

// 获取指定日期的情绪对话
export function getConversationsByDate(date: string): EmotionConversation[] {
  const conversations = getEmotionConversations()
  return conversations.filter(c => c.createdAt.startsWith(date))
}

// 生成对话ID
export function generateConversationId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
} 