import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  let topic = ''
  let slideIndex = 0
  let totalSlides = 10

  try {
    const body = await request.json()
    topic = body.topic
    const additionalContent = body.additionalContent
    slideIndex = body.slideIndex || 0
    totalSlides = body.totalSlides || 10

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      )
    }

    const systemPrompt = `You are a Christian preacher, Bible teacher, and sermon presentation designer.

You are generating ONE slide (${slideIndex + 1} of ${totalSlides}) for a sermon presentation on the topic "${topic}".

Guidelines for this slide:
- Create spiritually rich, meaningful content suitable for church services, online preaching, or Bible studies
- Keep tone pastoral, respectful, and faith-centered
- Ensure smooth flow that fits into the overall presentation structure
- Include relevant Bible verse(s) naturally embedded (cite book, chapter, and verse)
- Provide clear biblical messages with spiritual explanations
- Break down complex ideas into understandable lessons
- Include practical life applications based on biblical teachings

Slide Structure Guidelines:
- Slide 1: Introduction - opening message, scripture focus, and theme
- Slides 2-${totalSlides - 2}: Main biblical teachings with explanations and examples
- Slide ${totalSlides - 1}: Application - how the message applies to daily Christian life
- Slide ${totalSlides}: Conclusion - summary and spiritual encouragement

Presentation style:
- Use short, clear bullet points suitable for preaching slides
- Avoid overly academic or technical language
- Maintain a professional, inspiring, and clear tone

Output Format:
Return ONLY JSON in this exact format:
{"title": "Slide Title", "scripture": "Scripture Reference (if applicable)", "content": "Bullet point 1\\nBullet point 2\\nBullet point 3", "notes": "Optional Speaker Notes (sermon explanations)"}

Ensure the slide is biblically sound, spiritually encouraging, and appropriate for church or online ministry use.`

    const userPrompt = `Topic: "${topic}"${additionalContent ? `\nAdditional Context: ${additionalContent}` : ''}

Create slide ${slideIndex + 1} of ${totalSlides} for this presentation. Return JSON only.`

     const controller = new AbortController()
     const timeoutId = setTimeout(() => controller.abort(), 60000)

     try {
       const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
         method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json'
          },
         signal: controller.signal,
         body: JSON.stringify({
           model: 'openai/gpt-4o-mini',
           messages: [
             { role: 'system', content: systemPrompt },
             { role: 'user', content: userPrompt }
           ],
           temperature: 0.7,
           max_tokens: 4000
         })
       })

      clearTimeout(timeoutId)

      const data = await response.json()

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to generate presentation')
      }

       const content = data.choices?.[0]?.message?.content?.trim() || ''

      const jsonMatch = content.match(/\{[\s\S]*\}/)

      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }

      const slide = JSON.parse(jsonMatch[0])

      if (!slide.title || !slide.content) {
        throw new Error('Invalid slide format')
      }

      return NextResponse.json(slide)
    } catch (fetchError: unknown) {
      clearTimeout(timeoutId)
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        throw new Error('Request timeout - OpenRouter too slow')
      }
      throw fetchError
    }
  } catch (error: unknown) {
    console.error('Presentation generation error:', error)
    
    const fallbackSlides = [
      {
        title: `Introduction to ${topic}`,
        scripture: '',
        content: `Understanding the importance of ${topic}\nHow this topic applies to our daily lives\nSetting the foundation for our study today`,
        notes: `Begin with a warm welcome and prayer. Introduce the topic and why it's relevant to the congregation.`
      },
      {
        title: 'Scriptural Foundation',
        scripture: 'Various passages related to the topic',
        content: `Key biblical references\nHistorical and cultural context\nGod's promises and teachings on this subject`,
        notes: `Explain the background of the scriptures. Connect the ancient context to modern application.`
      },
      {
        title: 'Understanding the Heart of God',
        scripture: 'Relevant Bible verses',
        content: `God's character revealed through this topic\nHis love and wisdom in addressing our needs\nThe depth of His care for humanity`,
        notes: `Emphasize God's compassion and understanding. Share how this reflects His nature.`
      },
      {
        title: 'Key Biblical Principles',
        scripture: 'Core teaching passages',
        content: `Important principles to remember\nBiblical wisdom and guidance\nLessons we can learn from Scripture`,
        notes: `Break down complex ideas into simple, memorable principles. Use everyday examples.`
      },
      {
        title: 'Practical Applications',
        scripture: 'Application-focused verses',
        content: `How to apply these teachings daily\nMaking biblical principles practical\nSteps for implementation in our lives`,
        notes: `Provide concrete, actionable steps. Encourage personal reflection and commitment.`
      },
      {
        title: 'Overcoming Challenges',
        scripture: 'Encouragement passages',
        content: `Common obstacles and how to overcome them\nGod's strength in our weakness\nFinding hope and perseverance`,
        notes: `Address potential difficulties. Share stories of overcoming and God's faithfulness.`
      },
      {
        title: 'Personal Reflection',
        scripture: 'Reflection verses',
        content: `How this impacts our faith journey\nAreas for spiritual growth\nSteps to take forward in faith`,
        notes: `Guide the congregation in personal reflection. Encourage journaling or discussion.`
      },
      {
        title: 'Community and Fellowship',
        scripture: 'Community-focused passages',
        content: `The importance of Christian community\nSupporting one another in faith\nBuilding each other up in love`,
        notes: `Emphasize the role of the church family. Encourage accountability and mutual support.`
      },
      {
        title: 'Conclusion and Call to Action',
        scripture: 'Summarizing verses',
        content: `Summary of main points\nCall to action and commitment\nEncouragement for the journey ahead`,
        notes: `Bring the message to a powerful close. End with prayer and blessing.`
      }
    ]

    const fallbackSlide = fallbackSlides[slideIndex] || fallbackSlides[0]
    return NextResponse.json(fallbackSlide)
  }
}
