import { NextRequest, NextResponse } from 'next/server'
import { unlink } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    // Only delete files inside /uploads/ (safety check)
    if (!url || !url.startsWith('/uploads/')) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
    }

    const filename = url.replace('/uploads/', '')
    // Prevent path traversal attack
    if (filename.includes('/') || filename.includes('..')) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 })
    }

    const filepath = path.join(process.cwd(), 'public', 'uploads', filename)

    if (existsSync(filepath)) {
      await unlink(filepath)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
