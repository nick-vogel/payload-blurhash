import type { CollectionAfterChangeHook } from 'payload'

import type { BlurhashPluginOptions } from '../types.js'

import {
  DEFAULT_COMPONENT_X,
  DEFAULT_COMPONENT_Y,
} from '../defaults.js'
import { getImageBuffer } from '../utils/getImageBuffer.js'
import { encodeBlurhash } from '../utils/encodeBlurhash.js'

export const generateBlurhash = (
  options: BlurhashPluginOptions,
): CollectionAfterChangeHook => {
  return async ({
    collection,
    context,
    doc,
    previousDoc,
    req,
  }) => {
    if (context.skipBlurhash) {
      return doc
    }
    const isNewUpload =
      req.file &&
      req.file.mimetype?.startsWith('image/')
    const xChanged =
      doc.blurhashComponentX !==
      previousDoc?.blurhashComponentX
    const yChanged =
      doc.blurhashComponentY !==
      previousDoc?.blurhashComponentY

    if (!isNewUpload && !xChanged && !yChanged) {
      return doc
    }

    let imageBuffer: Buffer | null = null
    if (isNewUpload && req.file?.data) {
      imageBuffer = req.file.data
    } else if (
      (xChanged || yChanged) &&
      doc.url
    ) {
      try {
        imageBuffer = await getImageBuffer(
          doc.url as string,
          req,
        )
      } catch (err) {
        req.payload.logger.error({
          err,
          msg: 'blurhash: failed to fetch image for regeneration',
        })
        return doc
      }
    }

    if (!imageBuffer) {
      return doc
    }
    const componentX =
      doc.blurhashComponentX ??
      options.componentX ??
      DEFAULT_COMPONENT_X
    const componentY =
      doc.blurhashComponentY ??
      options.componentY ??
      DEFAULT_COMPONENT_Y

    const blurhash = await encodeBlurhash(
      imageBuffer,
      componentX,
      componentY,
    )
    if (!blurhash) {
      return doc
    }

    await req.payload.update({
      id: doc.id,
      collection: collection.slug,
      context: { skipBlurhash: true },
      data: { blurhash },
      req,
    })
    return { ...doc, blurhash }
  }
}
