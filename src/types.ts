export interface BlurhashPluginOptions {
  /**
   * Limit to specific upload collection; omit = all upload collections
   * */
  collections?: string[]
  /**
   * Default X resize dimension in pixels (1-9)
   * @default 4 */
  componentX?: number
  /**
   * Default Y resize dimension in pixels (1-9)
   * @default 3 */
  componentY?: number
  /**
   * Enable or disable the plugin
   * @default true */
  enabled?: boolean
}
