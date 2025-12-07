import type { VercelRequest, VercelResponse } from '@vercel/node'

const BACKEND_URL = 'http://ec2-43-200-185-236.ap-northeast-2.compute.amazonaws.com:8080'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers for ALL requests (including OPTIONS)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization')

  // Prevent caching to avoid 304 responses
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')
  console.log('req.method', req.method);
  console.log('req.path', req.url);
  // Handle OPTIONS preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Get the path from the request
  const path = Array.isArray(req.query.path)
    ? req.query.path.join('/')
    : req.query.path || ''

  const targetUrl = `${BACKEND_URL}/${path}`

  // Forward query parameters
  const searchParams = new URLSearchParams()
  Object.entries(req.query).forEach(([key, value]) => {
    if (key !== 'path' && value) {
      const val = Array.isArray(value) ? value[0] : value
      searchParams.append(key, val)
    }
  })
  const queryString = searchParams.toString()
  const finalUrl = queryString ? `${targetUrl}?${queryString}` : targetUrl
  console.log("finalUrl", finalUrl);
  try {
    // 원본 요청의 헤더를 그대로 전달 (필요한 헤더만 필터링)
    const forwardHeaders: Record<string, string> = {}
    
    // 원본 요청의 모든 헤더를 전달 (host, connection 등 제외)
    Object.entries(req.headers).forEach(([key, value]) => {
      const lowerKey = key.toLowerCase()
      // Vercel/Vercel 관련 헤더는 제외
      if (
        !lowerKey.startsWith('x-vercel-') &&
        !lowerKey.startsWith('x-forwarded-') &&
        lowerKey !== 'host' &&
        lowerKey !== 'connection' &&
        lowerKey !== 'content-length'
      ) {
        if (value) {
          forwardHeaders[key] = Array.isArray(value) ? value[0] : value
        }
      }
    })

    // Forward the request to backend
    const response = await fetch(finalUrl, {
      method: req.method,
      headers: forwardHeaders,
      body: req.method !== 'GET' && req.method !== 'HEAD' && req.body
        ? (typeof req.body === 'string' ? req.body : JSON.stringify(req.body))
        : undefined,
    })
    console.log("response", response.status);

    // Get response data
    const contentType = response.headers.get('content-type') || ''
    let data

    if (contentType.includes('application/json')) {
      data = await response.json()
    } else if (contentType.includes('text/event-stream')) {
      // For SSE, we need to handle streaming differently
      const reader = response.body?.getReader()
      if (!reader) {
        return res.status(500).json({ error: 'No response body' })
      }

      res.setHeader('Content-Type', 'text/event-stream')
      res.setHeader('Cache-Control', 'no-cache')
      res.setHeader('Connection', 'keep-alive')

      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        res.write(decoder.decode(value))
      }
      return res.end()
    } else {
      data = await response.text()
    }

    // Return response (CORS headers already set at the top)
    return res.status(response.status).json(data)
  } catch (error) {
    console.error('Proxy error:', error)
    return res.status(500).json({
      error: 'Proxy error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
