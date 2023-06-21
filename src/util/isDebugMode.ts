import { useDebugModeStore } from "@/stores/debugMode"

const configuredDebugMode = (import.meta.env.VITE_DEBUG_MODE == 'true')

export default function isDebugMode() {
  try {
    const localDebugMode = useDebugModeStore().debugMode
    if (localDebugMode != undefined) {
      return localDebugMode
    }
  }
  catch {
    // ignore when pinia is not set up yet
  }
  return configuredDebugMode
}
