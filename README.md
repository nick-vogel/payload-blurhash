# payload-blurhash

A [Payload CMS](https://payloadcms.com) plugin that automatically generates a tiny base64 WebP placeholder ("blurhash") for image uploads. Use it to render an instant blurred preview while the full image loads — the same trick Next.js, Medium, and Unsplash use.

The placeholder is stored as a `data:image/webp;base64,...` string directly on the upload document, so your frontend can render it without an extra request.

## Install

```bash
pnpm add payload-blurhash
# or
npm install payload-blurhash
```

`sharp` is a peer dependency. If you're already running Payload, you have it.

## Usage

```ts
// payload.config.ts
import { buildConfig } from 'payload'
import { blurhashPlugin } from 'payload-blurhash'

export default buildConfig({
  plugins: [
    blurhashPlugin({
      // Optional — limit to specific upload collections.
      // Omit to apply to all upload-enabled collections.
      collections: ['media'],
    }),
  ],
})
```

The plugin adds the following fields to each targeted upload collection:

| Field | Type | Description |
| --- | --- | --- |
| `blurhash` | `text` (read-only) | The base64-encoded WebP data URL. |
| `blurhashComponentX` | `number` (1–9) | Horizontal resolution of the placeholder. |
| `blurhashComponentY` | `number` (1–9) | Vertical resolution of the placeholder. |
| `blurhashPreview` | `ui` | Sidebar preview with a "Regenerate" button. |

A blurhash is generated on every new image upload, and re-generated whenever `blurhashComponentX` or `blurhashComponentY` change.

### Options

```ts
blurhashPlugin({
  collections?: string[]    // upload collection slugs; omit = all
  componentX?: number       // default X resolution, 1–9 (default: 4)
  componentY?: number       // default Y resolution, 1–9 (default: 3)
  enabled?: boolean         // disable without uninstalling (default: true)
})
```

### Rendering the placeholder

The value is already a base64 WebP data URL, so it drops straight into `next/image` as `blurDataURL`:

```tsx
import Image from 'next/image'

<Image
  src={media.url}
  width={media.width}
  height={media.height}
  alt={media.alt ?? ''}
  placeholder="blur"
  blurDataURL={media.blurhash}
/>
```

Or use it as a plain `<img>` for a static blur:

```tsx
<img
  src={media.blurhash}
  style={{ aspectRatio: `${media.width} / ${media.height}` }}
/>
```

## Regenerate endpoint

The plugin registers `POST /api/blurhash/regenerate` for the in-admin "Regenerate" button. It requires an authenticated request and accepts:

```json
{
  "id": "<doc id>",
  "collection": "<slug>",
  "componentX": 4,
  "componentY": 3
}
```

It returns `{ "blurhash": "data:image/webp;base64,..." }` without persisting — saving the document writes the new value.

## Compatibility

- Payload `^3.0.0`
- Node `^18.20.2 || >=20.9.0`
- React `^18 || ^19`

## License

MIT © Nick Vogel
