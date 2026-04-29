import { PayloadRequest } from 'payload'

export async function getImageBuffer(
  url: string,
  req: PayloadRequest,
): Promise<Buffer> {
  let fetchUrl = url
  if (!url.startsWith('http')) {
    const origin =
      req.payload.config.serverURL ||
      req.headers.get('origin') ||
      req.headers
        .get('referer')
        ?.replace(/\/[^/]*$/, '') ||
      `http://localhost:${process.env.PORT || 3000}`
    fetchUrl = `${origin}${url}`
  }

  const res = await fetch(fetchUrl, {
    headers: {
      cookie: req.headers.get('cookie') || '',
    },
  })

  if (!res.ok) {
    throw new Error(
      `Failed to fetch image: ${res.status} ${res.statusText}`,
    )
  }

  return Buffer.from(await res.arrayBuffer())
}
