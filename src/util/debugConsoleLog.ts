import isDebugMode from "./isDebugMode";

const timeNumberFormat = Intl.NumberFormat('en-US', {minimumIntegerDigits:2})

export default function debugConsoleLog(message : string) {
  if (isDebugMode()) {
    const time = new Date().toLocaleTimeString()
    console.log(`${time} ${message}`)
  }
}
