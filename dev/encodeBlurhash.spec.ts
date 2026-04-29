import sharp from 'sharp'
import { describe, expect, test } from 'vitest'

import { encodeBlurhash } from '../src/utils/encodeBlurhash.js'

const makeImage = async (): Promise<Buffer> =>
  sharp({
    create: {
      background: { b: 100, g: 200, r: 10 },
      channels: 3,
      height: 24,
      width: 32,
    },
  })
    .png()
    .toBuffer()

describe('encodeBlurhash', () => {
  test('returns a webp data URL for a valid image', async () => {
    const buffer = await makeImage()
    const result = await encodeBlurhash(
      buffer,
      4,
      3,
    )
    expect(result).toMatch(
      /^data:image\/webp;base64,[A-Za-z0-9+/=]+$/,
    )
  })

  test('returns null for invalid input', async () => {
    const result = await encodeBlurhash(
      Buffer.from('not an image'),
      4,
      3,
    )
    expect(result).toBeNull()
  })

  test('different component sizes produce different output', async () => {
    const buffer = await makeImage()
    const small = await encodeBlurhash(
      buffer,
      2,
      2,
    )
    const large = await encodeBlurhash(
      buffer,
      9,
      9,
    )
    expect(small).not.toBe(large)
  })
})
