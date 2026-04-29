import type { Payload } from 'payload'

import config from '@payload-config'
import { getPayload } from 'payload'
import sharp from 'sharp'
import {
  afterAll,
  beforeAll,
  describe,
  expect,
  test,
} from 'vitest'

let payload: Payload

const makeImage = async (): Promise<Buffer> =>
  sharp({
    create: {
      width: 64,
      height: 48,
      channels: 3,
      background: { r: 200, g: 100, b: 50 },
    },
  })
    .png()
    .toBuffer()

afterAll(async () => {
  await payload.destroy()
})

beforeAll(async () => {
  payload = await getPayload({ config })
})

describe('blurhashPlugin', () => {
  test('adds blurhash fields to upload collections', () => {
    const media = payload.collections['media']
    expect(media).toBeDefined()
    const fieldNames = media.config.fields.map(
      (f) => 'name' in f && f.name,
    )
    expect(fieldNames).toContain('blurhash')
    expect(fieldNames).toContain(
      'blurhashComponentX',
    )
    expect(fieldNames).toContain(
      'blurhashComponentY',
    )
    expect(fieldNames).toContain('blurhashPreview')
  })

  test('does not add fields to non-upload collections', () => {
    const posts = payload.collections['posts']
    const fieldNames = posts.config.fields.map(
      (f) => 'name' in f && f.name,
    )
    expect(fieldNames).not.toContain('blurhash')
  })

  test('generates blurhash on image upload', async () => {
    const buffer = await makeImage()
    const doc = await payload.create({
      collection: 'media',
      data: {},
      file: {
        data: buffer,
        mimetype: 'image/png',
        name: 'test.png',
        size: buffer.length,
      },
    })
    const reloaded = await payload.findByID({
      id: doc.id,
      collection: 'media',
    })
    expect(reloaded.blurhash).toMatch(
      /^data:image\/webp;base64,/,
    )
  })

  test('different component sizes produce different blurhash on upload', async () => {
    const buffer = await makeImage()
    const small = await payload.create({
      collection: 'media',
      data: { blurhashComponentX: 2, blurhashComponentY: 2 },
      file: {
        data: buffer,
        mimetype: 'image/png',
        name: 'small.png',
        size: buffer.length,
      },
    })
    const large = await payload.create({
      collection: 'media',
      data: { blurhashComponentX: 9, blurhashComponentY: 9 },
      file: {
        data: buffer,
        mimetype: 'image/png',
        name: 'large.png',
        size: buffer.length,
      },
    })
    expect(small.blurhash).toBeTruthy()
    expect(large.blurhash).toBeTruthy()
    expect(small.blurhash).not.toBe(large.blurhash)
  })

  test('registers regenerate endpoint', () => {
    const endpoint = payload.config.endpoints.find(
      (e) =>
        e.path === '/blurhash/regenerate' &&
        e.method === 'post',
    )
    expect(endpoint).toBeDefined()
  })
})
