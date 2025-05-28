import { type NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { emotion, text, conversationHistory = [] } = await request.json()

    // 构建对话历史
    const messages = [
      {
        role: "system",
        content: `你是一个专业的情绪支持助手，名字叫"心灵伙伴"。你的任务是为用户提供温暖、理解和专业的情绪支持。

请遵循以下原则：
1. 用温暖、理解的语调回应
2. 承认和验证用户的情绪感受
3. 提供积极但现实的建议
4. 使用简洁、易懂的语言
5. 回复长度控制在100-200字
6. 避免过于专业的心理学术语
7. 鼓励用户但不要过于乐观
8. 如果情况严重，建议寻求专业帮助
9. 如果是多轮对话，要记住之前的内容并保持连贯性

当前用户的情绪状态是：${emotion}`,
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
