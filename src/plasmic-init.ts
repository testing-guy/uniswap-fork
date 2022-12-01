import { initPlasmicLoader } from '@plasmicapp/loader-react'
import SwapApp from 'pages/SwapApp'
export const PLASMIC = initPlasmicLoader({
  projects: [
    {
      id: 'qHvhzC9b5qsPjjfcmj7Pdn', // ID of a project you are using
      token: 'PAnbFYJOMrbwKt6usKLN675ac8iTYR4rSgRwWys8Lqi05EzB3n8JTb5wLiBMy6XCDcGLNUKuFREqIWeKK6UQ', // API token for that project
    },
  ],
  // Fetches the latest revisions, whether or not they were unpublished!
  // Disable for production to ensure you render only published changes.
  preview: true,
})

PLASMIC.registerComponent(SwapApp, {
  name: 'Swap',
  props: {
    verbose: 'boolean',
    children: 'slot',
  },
})
