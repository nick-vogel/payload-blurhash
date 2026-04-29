'use client'

import {
  useConfig,
  useDocumentInfo,
  useFormFields,
} from '@payloadcms/ui'
import {
  useCallback,
  useEffect,
  useState,
} from 'react'

export const BlurhashPreview = () => {
  const { id, collectionSlug } = useDocumentInfo()
  const { config } = useConfig()
  const blurhash = useFormFields(
    ([fields]) => fields.blurhash,
  )
  const componentX = useFormFields(
    ([fields]) => fields.blurhashComponentX,
  )
  const componentY = useFormFields(
    ([fields]) => fields.blurhashComponentY,
  )
  const imageWidth = useFormFields(
    ([fields]) => fields.width,
  )
  const imageHeight = useFormFields(
    ([fields]) => fields.height,
  )

  const [previewSrc, setPreviewSrc] = useState<
    null | string
  >(null)
  const [isPreview, setIsPreview] =
    useState(false)
  const [isLoading, setIsLoading] =
    useState(false)
  const savedHash = blurhash?.value as
    | string
    | undefined
  const xVal = componentX?.value as
    | number
    | undefined
  const yVal = componentY?.value as
    | number
    | undefined
  const imgW = imageWidth?.value as
    | number
    | undefined
  const imgH = imageHeight?.value as
    | number
    | undefined

  const aspectRatio =
    imgW && imgH ? `${imgW} / ${imgH}` : undefined
  useEffect(() => {
    if (savedHash && !isPreview) {
      setPreviewSrc(savedHash)
    }
  }, [savedHash, isPreview])
  useEffect(() => {
    setIsPreview(false)
  }, [savedHash])
  const regenerate = useCallback(async () => {
    if (
      !id ||
      !collectionSlug ||
      !xVal ||
      !yVal
    ) {
      return
    }
    setIsLoading(true)
    try {
      const apiRoute = config.routes.api || '/api'
      const res = await fetch(
        `${apiRoute}/blurhash/regenerate`,
        {
          body: JSON.stringify({
            id,
            collection: collectionSlug,
            componentX: xVal,
            componentY: yVal,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
        },
      )
      if (!res.ok) {
        return
      }
      const data = await res.json()
      if (data.blurhash) {
        setPreviewSrc(data.blurhash)
        setIsPreview(true)
      }
    } catch {
      // swallow error
    } finally {
      setIsLoading(false)
    }
  }, [
    id,
    collectionSlug,
    xVal,
    yVal,
    config.routes.api,
  ])

  if (!previewSrc) {
    return (
      <div style={{ padding: '12px 0' }}>
        <p
          style={{
            color: 'var(--theme-elevation-500)',
            fontSize: '13px',
            margin: 0,
          }}
        >
          No blur preview generated yet. Upload an
          image to generate one.
        </p>
      </div>
    )
  }
  return (
    <div style={{ padding: '12px 0' }}>
      <p
        style={{
          fontSize: '13px',
          fontWeight: 500,
          margin: '0 0 8px',
        }}
      >
        Blur Preview
        {isPreview && (
          <span
            style={{
              color: 'var(--theme-elevation-500)',
              fontWeight: 400,
            }}
          >
            {' '}
            (save to persist)
          </span>
        )}
      </p>
      <img
        alt="Blur preview"
        src={previewSrc}
        style={{
          aspectRatio,
          height: 'auto',
          width: '100%',
        }}
      />
      <button
        aria-disabled={isLoading}
        aria-label="Blurhash preview"
        className={`btn btn--icon-style-without-border btn--size-medium btn--withoutPopup btn--style-primary${isLoading ? ' btn--disabled' : ''}`}
        disabled={isLoading}
        onClick={regenerate}
        style={{ marginTop: '8px' }}
        type="button"
      >
        <span className="btn__content">
          <span className="btn__label">
            {isLoading
              ? 'Regenerating...'
              : 'Regenerate'}
          </span>
        </span>
      </button>
    </div>
  )
}
