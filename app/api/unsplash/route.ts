import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const UNSPLASH_API_URL = 'https://api.unsplash.com'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('query')
    const page = searchParams.get('page') || '1'
    const perPage = searchParams.get('per_page') || '12'

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    const accessKey = process.env.UNSPLASH_ACCESS_KEY
    if (!accessKey) {
      console.error('UNSPLASH_ACCESS_KEY is not configured')
      return NextResponse.json(
        { error: 'Unsplash is not configured' },
        { status: 500 }
      )
    }

    // Search photos from Unsplash
    const response = await fetch(
      `${UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&orientation=landscape`,
      {
        headers: {
          'Authorization': `Client-ID ${accessKey}`,
          'Accept-Version': 'v1',
        },
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('Unsplash API error:', error)
      
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Invalid Unsplash API key' },
          { status: 401 }
        )
      }
      
      if (response.status === 403) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch images from Unsplash' },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Format the response for our frontend
    const formattedResults = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      results: data.results.map((photo: any) => ({
        id: photo.id,
        urls: {
          raw: photo.urls.raw,
          regular: photo.urls.regular,
          small: photo.urls.small,
          thumb: photo.urls.thumb,
        },
        width: photo.width,
        height: photo.height,
        description: photo.description || photo.alt_description,
        user: {
          name: photo.user.name,
          username: photo.user.username,
          profile_url: photo.user.links.html,
        },
        links: {
          download: photo.links.download_location,
        },
        blur_hash: photo.blur_hash,
      })),
      total: data.total,
      total_pages: data.total_pages,
    }

    return NextResponse.json(formattedResults)
  } catch (error) {
    console.error('Unsplash search error:', error)
    return NextResponse.json(
      { error: 'Failed to search images' },
      { status: 500 }
    )
  }
}

// Track download for Unsplash guidelines
export async function POST(request: NextRequest) {
  try {
    const { downloadLocation } = await request.json()

    if (!downloadLocation) {
      return NextResponse.json(
        { error: 'Download location is required' },
        { status: 400 }
      )
    }

    const accessKey = process.env.UNSPLASH_ACCESS_KEY
    if (!accessKey) {
      return NextResponse.json(
        { error: 'Unsplash is not configured' },
        { status: 500 }
      )
    }

    // Trigger download tracking as per Unsplash guidelines
    const response = await fetch(downloadLocation, {
      headers: {
        'Authorization': `Client-ID ${accessKey}`,
      },
    })

    if (!response.ok) {
      console.error('Failed to track download')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Download tracking error:', error)
    return NextResponse.json({ success: true }) // Don't fail the UI operation
  }
}