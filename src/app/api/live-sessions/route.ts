import { NextRequest, NextResponse } from 'next/server'
import { createLiveSession, getLiveSession, updateLiveSession, deleteLiveSession } from '@/lib/serverActions'

export async function POST(request: NextRequest) {
  try {
    const { presentationId } = await request.json()
    
    const result = await createLiveSession(presentationId)
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
    
    return NextResponse.json({ sessionId: result.sessionId })
  } catch (error) {
    console.error('Error creating live session:', error)
    return NextResponse.json({ error: 'Failed to create live session' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }
    
    const session = await getLiveSession(sessionId)
    
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }
    
    return NextResponse.json({ session })
  } catch (error) {
    console.error('Error fetching live session:', error)
    return NextResponse.json({ error: 'Failed to fetch live session' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { sessionId, updates } = await request.json()
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }
    
    const result = await updateLiveSession(sessionId, updates)
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating live session:', error)
    return NextResponse.json({ error: 'Failed to update live session' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }
    
    const result = await deleteLiveSession(sessionId)
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting live session:', error)
    return NextResponse.json({ error: 'Failed to delete live session' }, { status: 500 })
  }
}