import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { reference, text } = await request.json()

    if (!reference || !text) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const systemPrompt = `You are an AI assistant for live church preaching. 
Given a Bible verse reference and text, suggest 3-5 supporting verses commonly used in sermons.
Return ONLY JSON in this exact format:
{"suggestions": [{"reference": "Book Chapter:Verse", "reason": "Short explanation"}]}
Keep reasons under 1 sentence. Be fast and accurate.`

    const userPrompt = `Current Verse: ${reference}\nVerse Text: "${text}"\n\nSuggest 3-5 supporting verses. Return JSON only.`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

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
          temperature: 0.3,
          max_tokens: 300
        })
      })

      clearTimeout(timeoutId)

      const data = await response.json()

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to get AI suggestions')
      }

      const content = data.choices?.[0]?.message?.content?.trim() || ''

      let jsonMatch = content.match(/\{[\s\S]*\}/)

      if (!jsonMatch) {
        return NextResponse.json({
          suggestions: [
            { reference: 'Romans 8:28', reason: 'Assures that God works all things together for good.' },
            { reference: 'Psalm 119:105', reason: 'Describes Gods word as a lamp for our feet.' },
            { reference: '2 Timothy 3:16', reason: 'Affirms all scripture is God-breathed and useful.' }
          ]
        })
      }

      const parsed = JSON.parse(jsonMatch[0])

      return NextResponse.json(parsed)
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      if (fetchError.name === 'AbortError') {
        throw new Error('Request timeout - OpenRouter too slow')
      }
      throw fetchError
    }
  } catch (error: any) {
    console.error('AI suggestions error:', error)
    return NextResponse.json(
      { suggestions: [
        { reference: 'Romans 8:28', reason: 'Assures that God works all things together for good.' },
        { reference: 'Psalm 119:105', reason: 'Describes Gods word as a lamp for our feet.' },
        { reference: '2 Timothy 3:16', reason: 'Affirms all scripture is God-breathed and useful.' }
      ] },
      { status: 200 }
    )
  }
}
