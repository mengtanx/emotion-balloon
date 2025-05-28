import { type NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { emotion, text, conversationHistory = [] } = await request.json()

    // 构建对话历史
    const messages = [
      {
        role: "system",
        content: `你是一个基于认知行为疗法（CBT）训练的专业情绪支持助手，名字叫"心灵伙伴"。你深入理解《伯恩斯新情绪疗法》的核心理念，致力于帮助用户识别和改变负面思维模式。

核心治疗原则：
1. **思维与情绪的关系**：帮助用户理解情绪来源于思维，而不是外在事件本身
2. **识别认知扭曲**：温和地帮助用户发现十种常见认知扭曲模式：
   - 全有或全无思维（非黑即白）
   - 过度概括
   - 心理过滤（只关注负面）
   - 贬低正面思考
   - 妄下结论（读心术/算命师错误）
   - 放大与缩小
   - 情绪化推理
   - 应该句式
   - 贴标签
   - 个人化

回应策略：
1. **表达同理心**：首先承认和验证用户的感受，让他们感到被理解
2. **苏格拉底式提问**：通过温和的提问帮助用户自己发现思维模式
3. **现实检验**：帮助用户客观地审视他们的想法
4. **积极思维替代**：引导用户找到更平衡、现实的思维方式
5. **行为激活**：在适当时候建议具体的行动步骤

语言特点：
- 使用温暖、非评判的语调
- 避免说教，多用提问引导思考
- 用简洁易懂的语言，避免过于专业的术语
- 保持希望和乐观，但要现实
- 回复长度控制在150-250字
- 如果用户情况严重，建议寻求专业心理健康服务

当前用户的情绪状态是：${emotion}
请基于认知行为疗法的原则，用关爱和专业的方式回应用户。`,
      },
      ...conversationHistory.map((msg: any) => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content,
      })),
      {
        role: "user",
        content: text,
      },
    ]

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://emotion-balloon.vercel.app",
        "X-Title": "Emotion Balloon",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages,
        temperature: 0.7,
        max_tokens: 300,
        stream: true,
      }),
    })

    if (!response.ok) {
      throw new Error("API request failed")
    }

    // 创建流式响应
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const reader = response.body?.getReader()
          if (!reader) {
            throw new Error("Failed to get response reader")
          }

          let buffer = ""

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ""

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') {
                  controller.close()
                  return
                }

                try {
                  const parsed = JSON.parse(data)
                  const content = parsed.choices?.[0]?.delta?.content
                  if (content) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
                  }
                } catch (error) {
                  // Skip invalid JSON
                }
              }
            }
          }
        } catch (error) {
          console.error("Stream error:", error)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            content: "我理解你现在的感受。每一种情绪都是有意义的，请给自己一些时间和空间。如果需要，寻求专业帮助也是很好的选择。",
            error: true 
          })}\n\n`))
        }
        controller.close()
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error("Error calling AI API:", error)
    
    // 返回错误时的流式响应
    const encoder = new TextEncoder()
    const errorMessage = "抱歉，暂时无法获取回复。但请记住，你的感受是被理解和接纳的。每一种情绪都有它存在的意义。"
    
    const stream = new ReadableStream({
      start(controller) {
        // 模拟打字机效果，即使是错误消息
        let i = 0
        const interval = setInterval(() => {
          if (i < errorMessage.length) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: errorMessage[i] })}\n\n`))
            i++
          } else {
            clearInterval(interval)
            controller.close()
          }
        }, 50)
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  }
}
