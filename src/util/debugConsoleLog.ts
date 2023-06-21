import isDebugMode from "./isDebugMode";

export default function debugConsoleLog(message : string) {
  if (isDebugMode()) {
    const time = new Date().toLocaleTimeString()
    console.log(`${time} ${message}`)
  }
}
