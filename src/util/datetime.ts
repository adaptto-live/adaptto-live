import type { Talk } from '@/stores/talks'

const locale = 'en-GB'
const timeOptions : Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }

/**
 * Format time.
 * Example: 10:30.
 * @param {Date} date Date/time value
 * @returns {string} Formatted time
 */
export function formatTime(date : Date) : string {
  return date.toLocaleTimeString(locale, timeOptions)
}

/**
 * Converts a number counting days since 1/1/1900 as used in Excel/Google Sheets to a date value.
 * @param {float} value Float date value from Excel/Google Sheets
 * @returns {Date} Date value
 */
export function convertSheetDateValue(value : number) : Date {
  const date = new Date(0)
  date.setUTCMilliseconds(Math.round((value - 25569) * 86400 * 1000))
  return date
}

/**
 * Time info for talk e.g. "10:30 - 11:00".
 * @param talk Talk
 * @returns Formatted time
 */
export function formatTalkTime(talk : Talk) : string|undefined {
  if (!talk.startTime || !talk.endTime) {
    return undefined
  }
  const start = convertSheetDateValue(talk.startTime)
  const end = convertSheetDateValue(talk.endTime)
  return `${formatTime(start)} - ${formatTime(end)}`
}

/**
 * Duration info for talk e.g. "30 min + 5 min FAQ".
 * @param talk Talk
 * @returns Formatted duration
 */
export function formatTalkDuration(talk : Talk) : string|undefined {
  if (!talk.duration) {
    return undefined
  }
  if (talk.durationFAQ) {
    return `${talk.duration} min + ${talk.durationFAQ} min FAQ`
  }
  else {
    return `${talk.duration} min`
  }
}

/**
 * Time and duration info for talk e.g. "10:30 - 11:00 (30 min + 5 min FAQ)".
 * @param talk Talk
 * @returns Formatted time + duration
 */
export function formatTalkTimeDuration(talk : Talk) : string|undefined {
  const talkTime = formatTalkTime(talk)
  const talkDuration = formatTalkDuration(talk)
  if (!talkTime || !talkDuration) {
    return undefined
  }
  return `${talkTime} (${talkDuration})`
}
