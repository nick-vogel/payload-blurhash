import { PayloadHandler } from 'payload'
import { getImageBuffer } from '../utils/getImageBuffer.js'
import { encodeBlurhash } from '../utils/encodeBlurhash.js'

export const regenerateHandler: PayloadHandler =
  async (req) => {
    if (!req.user) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 },
      )
    }
    if (!req.json) {
      return Response.json(
        { error: 'Invalid request' },
        { status: 400 },
      )
    }

    const {
      id,
      collection,
      componentX,
      componentY,
    } = await req.json()

    if (
      !id ||
      !collection ||
      !componentX ||
      !componentY
    ) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 },
      )
    }

    let doc: Record<string, unknown>
    try {
      doc = await req.payload.findByID({
        id,
        collection,
        req,
      })
    } catch {
      return Response.json(
        { error: 'Document not found' },
        { status: 404 },
      )
    }

    const url = doc.url as string | undefined
    if (!url) {
      return Response.json(
        { error: 'Document has no image URL' },
        { status: 400 },
      )
    }
    let imageBuffer: Buffer
    try {
      imageBuffer = await getImageBuffer(url, req)
    } catch (err) {
      req.payload.logger.error({
        err,
        msg: 'blurhash: regenerate failed to fetch image',
      })
      return Response.json(
        { error: 'Failed to fetch image' },
        { status: 500 },
      )
    }

    const blurhash = await encodeBlurhash(
      imageBuffer,
      componentX,
      componentY,
    )
    if (!blurhash) {
      return Response.json(
        { error: 'Failed to generate blur data URL' },
        { status: 500 },
      )
    }
    return Response.json({ blurhash })
  }
