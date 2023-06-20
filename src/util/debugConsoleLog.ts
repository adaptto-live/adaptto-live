import isDebugMode from "./isDebugMode";

export default function debugConsoleLog(message : string) {
  if (isDebugMode()) {
    console.log(message)
  }
}
