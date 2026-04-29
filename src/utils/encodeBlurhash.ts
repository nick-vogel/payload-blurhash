export async function encodeBlurhash(
  buffer: Buffer,
  componentX: number,
  componentY: number,
): Promise<null | string> {
  try {
    const sharp = (await import('sharp')).default
    const resized = await sharp(buffer)
      .resize({
        height: componentY,
        width: componentX,
      })
      .toFormat('webp')
      .toBuffer()
    const base64 = resized.toString('base64')
    return `data:image/webp;base64,${base64}`
  } catch {
    return null
  }
}
