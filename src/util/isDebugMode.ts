const debugMode = (import.meta.env.VITE_DEBUG_MODE == 'true')

export default function isDebugMode() {
  return debugMode
}
