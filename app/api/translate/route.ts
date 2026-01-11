import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { text, targetLanguage } = await request.json()

    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const targetLang = targetLanguage.toLowerCase() === 'tagalog' ? 'tl' : 'en'

    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`
    )

    const data = await response.json()

    if (data.responseStatus === 200) {
      return NextResponse.json({
        translatedText: data.responseData.translatedText
      })
    } else {
      throw new Error(data.responseDetails || 'Translation failed')
    }
  } catch (error) {
    console.error('Translation error:', error)
    return NextResponse.json(
      { error: 'Failed to translate text' },
      { status: 500 }
    )
  }
}