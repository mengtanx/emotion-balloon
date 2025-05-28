import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { emotion, text } = await request.json()

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://emotion-balloon.vercel.app",
        "X-Title": "Emotion Balloon",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat-v3-0324",
        messages: [
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

当前用户的情绪状态是：${emotion}
用户的描述：${text}`,
          },
          {
            role: "user",
            content: `我现在感到${emotion}，${text}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    })

    if (!response.ok) {
      throw new Error("API request failed")
    }

    const data = await response.json()
    const aiResponse =
      data.choices[0]?.message?.content ||
      "我理解你现在的感受。每一种情绪都是有意义的，请给自己一些时间和空间。如果需要，寻求专业帮助也是很好的选择。"

    return NextResponse.json({ response: aiResponse })
  } catch (error) {
    console.error("Error calling AI API:", error)
    return NextResponse.json(
      { response: "抱歉，暂时无法获取回复。但请记住，你的感受是被理解和接纳的。每一种情绪都有它存在的意义。" },
      { status: 500 },
    )
  }
}
