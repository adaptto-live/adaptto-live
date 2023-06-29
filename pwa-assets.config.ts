import { Preset, defineConfig } from '@vite-pwa/assets-generator/config'

const minimalPreset: Preset = {
  transparent: {
    sizes: [64, 192, 512],
    favicons: [[64, 'favicon.ico']]
  },
  maskable: {
    sizes: [512]
  },
  apple: {
    sizes: [180],
    padding: 0
  }
}

export default defineConfig({
  preset: minimalPreset,
  images: [
    'public/adaptto-favicon.svg'
  ]
})
