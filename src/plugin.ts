import type { Config } from 'payload'

import type { BlurhashPluginOptions } from './types.js'

import {
  DEFAULT_COMPONENT_X,
  DEFAULT_COMPONENT_Y,
} from './defaults.js'
import { regenerateHandler } from './endpoints/regenerate.js'
import { generateBlurhash } from './hooks/generateBlurhash.js'

export const blurhashPlugin =
  (options: BlurhashPluginOptions) =>
  (config: Config) => {
    if (options.enabled === false) {
      return config
    }

    if (!config.collections) {
      config.collections = []
    }

    const targetSlugs = options.collections
    const hook = generateBlurhash(options)
    for (const collection of config.collections) {
      if (!collection.upload) {
        continue
      }
      if (
        targetSlugs &&
        !targetSlugs.includes(collection.slug)
      ) {
        continue
      }
      collection.fields.push(
        {
          name: 'blurhash',
          type: 'text',
          admin: {
            position: 'sidebar',
            readOnly: true,
          },
        },
        {
          name: 'blurhashComponentX',
          type: 'number',
          admin: {
            description:
              'Horizontal pixel resolution of blur (1-9)',
            position: 'sidebar',
          },
          defaultValue:
            options.componentX ??
            DEFAULT_COMPONENT_X,
          label: 'Blur X',
          max: 9,
          min: 1,
        },
        {
          name: 'blurhashComponentY',
          type: 'number',
          admin: {
            description:
              'Vertical pixel resolution of blur (1-9)',
            position: 'sidebar',
          },
          defaultValue:
            options.componentY ??
            DEFAULT_COMPONENT_Y,
          label: 'Blur Y',
          max: 9,
          min: 1,
        },
        {
          name: 'blurhashPreview',
          type: 'ui',
          admin: {
            components: {
              Field: {
                path: 'payload-blurhash/client#BlurhashPreview',
              },
            },
            position: 'sidebar',
          },
        },
      )
      if (!collection.hooks) {
        collection.hooks = {}
      }
      if (!collection.hooks.afterChange) {
        collection.hooks.afterChange = []
      }
      collection.hooks.afterChange.push(hook)
    }
    if (!config.endpoints) {
      config.endpoints = []
    }
    config.endpoints.push({
      handler: regenerateHandler,
      method: 'post',
      path: '/blurhash/regenerate',
    })
    return config
  }
