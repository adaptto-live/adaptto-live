import { defineStore } from 'pinia'
import axios from 'axios'
import slugify from 'slugify'

export interface Talk {
  id: string
  day: number
  title: string
  speakers?: string
  startTime?: number
  endTime?: number
  duration?: number
  durationFAQ?: number
  url?: string
  lobby?: boolean
  isBreakOther?: boolean
}

export const useTalksStore = defineStore('talks', {
  state: () => {
    return {
      talks: [] as Talk[],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      loadingError: undefined as any
    }
  },
  actions: {
    async fill() {
      try {
        const scheduleDataUrl = import.meta.env.VITE_SCHEDULE_DATA_URL
        const queryIndexUrl = import.meta.env.VITE_QUERY_INDEX_URL
        if (scheduleDataUrl && queryIndexUrl) {
          this.talks = await getRemoteTalks(scheduleDataUrl, queryIndexUrl)
        }
        else {
          this.talks = await getLocalTalks()
        }
      }
      catch (err) {
        this.loadingError = err
        console.error(err)
      }
    }
  }
})

// load talk data from local json (for testing/development only)
async function getLocalTalks() : Promise<Talk[]> {
  return addDailyLobbyTalks((await import('@/data/talks.json')).default)
}

// load talk data from adapt.to website
async function getRemoteTalks(scheduleDataUrl: string, queryIndexUrl: string) : Promise<Talk[]> {
  const year = extractYear(scheduleDataUrl)
  const urlPrefix = getUrlPrefix(scheduleDataUrl)
  const schedule = await loadJson(scheduleDataUrl)
  const queryIndex = await loadJson(queryIndexUrl)

  const scheduleEntries = schedule.data as ScheduleEntry[]
  const queryIndexEntries = queryIndex.data as QueryIndexEntry[]
  const speakerEntries = queryIndexEntries.filter(entry => speakerPathPattern.test(entry.path ?? ''))
  const result = [] as Talk[]

  // ordinal counter per day to build stable break/other ids
  const breakOtherCountByDay = new Map<number, number>()

  scheduleEntries.forEach(entry => {
    const day = Number.parseInt(entry.Day)
    if (['talk','other_rating'].includes(entry.Type)) {
      const id = `${year}-${slugify(entry.Entry, {lower:true})}`
      const path = `/${year}/schedule/${entry.Entry}`
      // if a query index exists, this is a talk schedule entry
      const queryIndexEntry = queryIndexEntries.find(entry => entry.path == path)
      if (queryIndexEntry) {
        let title = queryIndexEntry.title
        const titleMatcher = titleWithoutSuffixPattern.exec(title)
        if (titleMatcher) {
          title = titleMatcher[1]
        }
        const speakers = resolveSpeakerDisplayNames(queryIndexEntry.speakers, speakerEntries)
        const startTime = parseFloatOrUndefined(entry.Start)
        const endTime = parseFloatOrUndefined(entry.End)
        const duration = parseIntOrUndefined(entry.Duration)
        const durationFAQ = parseIntOrUndefined(entry.FAQ)
        const url = `${urlPrefix}${path}`
        result.push({id, day, title, speakers, startTime, endTime, duration, durationFAQ, url})
      }
      // otherwise it's likely a non-talk entry, which should be treated like a talk and can be rated on
      else if (entry.Type === 'other_rating') {
        const title = entry.Entry
        const speakers = resolveSpeakerDisplayNames(entry.Speakers, speakerEntries)
        const startTime = parseFloatOrUndefined(entry.Start)
        const endTime = parseFloatOrUndefined(entry.End)
        const duration = parseIntOrUndefined(entry.Duration)
        result.push({id, day, title, speakers, startTime, endTime, duration})
      }
    }
    // for break and other entries, we generate a stable id based on the day and a per-day ordinal counter
    else if (['break','other'].includes(entry.Type)) {
      const ordinal = (breakOtherCountByDay.get(day) ?? 0) + 1
      breakOtherCountByDay.set(day, ordinal)
      const id = `${year}-break-other-day-${day}-${ordinal}`
      const title = entry.Entry
      const startTime = parseFloatOrUndefined(entry.Start)
      const endTime = parseFloatOrUndefined(entry.End)
      const duration = parseIntOrUndefined(entry.Duration)
      result.push({id, day, title, startTime, endTime, duration, isBreakOther: true})
    }
  })

  return addDailyLobbyTalks(result)
}

/**
 * Resolves speaker references to their display names.
 * Speaker references may be display names or internal speaker document names/paths
 * (used to disambiguate speakers that share the same display name). Each reference
 * is resolved to the actual speaker display name; unresolved references are kept as-is.
 * @param speakers Comma-separated speaker references
 * @param speakerEntries Query index entries of speakers
 * @returns Comma-separated speaker display names
 */
function resolveSpeakerDisplayNames(speakers : string|undefined, speakerEntries : QueryIndexEntry[]) : string|undefined {
  if (!speakers) {
    return speakers
  }
  return speakers.split(',')
    .map(speaker => speaker.trim())
    .filter(speaker => speaker !== '')
    .map(speaker => {
      const speakerPath = getPathName(speaker)
      const speakerEntry = speakerEntries.find(entry => entry.path === speakerPath
          || entry.title === speaker
          || getDocumentName(entry.path) === speaker)
      return speakerEntry?.title || speaker
    })
    .join(', ')
}

function getPathName(value : string) : string|undefined {
  if (absoluteUrlPattern.test(value)) {
    try {
      return new URL(value).pathname
    }
    catch {
      return undefined
    }
  }
  return value.startsWith('/') ? value : undefined
}

function getDocumentName(path : string) : string {
  return path.substring(path.lastIndexOf('/') + 1)
}

function parseFloatOrUndefined(value : string) : number|undefined {
  const result = Number.parseFloat(value)
  return Number.isNaN(result) ? undefined : result
}

function parseIntOrUndefined(value : string) : number|undefined {
  const result = Number.parseInt(value, 10)
  return Number.isNaN(result) ? undefined : result
}

/**
 * Adds a "Lobby" talk for each day before the actual talks.
 * @param talks Talks
 * @returns Talks with lobby talks
 */
function addDailyLobbyTalks(talks : Talk[]) : Talk[] {
  const days : number[] = []
  const result : Talk[] = []
  talks.forEach(talk => {
    if (!days.includes(talk.day)) {
      let talkIdPrefix = ''
      const firstDashPos = talk.id.indexOf('-')
      if (firstDashPos > 0) {
        talkIdPrefix = talk.id.substring(0, firstDashPos)
      }
      result.push({
        id: `${talkIdPrefix}-lobby-day-${talk.day}`,
        day: talk.day,
        title: `Lobby Day ${talk.day}`,
        lobby: true
      })
      days.push(talk.day)
    }
    result.push(talk)
  })
  return result
}

const scheduleUrlPattern = /^(.*)\/(\d{4})\/schedule-data\.json$/
// group must end on a non-whitespace char, so it can't overlap with the following \s+ (avoids superlinear backtracking)
const titleWithoutSuffixPattern = /^(.*\S)\s+-\s+adaptTo\(\)\s+\d{4}\s*$/
const speakerPathPattern = /^\/speakers\/[^/]+$/
const absoluteUrlPattern = /^https?:\/\/[^/]+\//

function extractYear(scheduleDataUrl : string) : string {
  const matcher = scheduleUrlPattern.exec(scheduleDataUrl)
  if (matcher) {
    return matcher[2]
  }
  throw new Error(`Unable to extract year from url ${scheduleDataUrl}`)
}

function getUrlPrefix(scheduleDataUrl : string) {
  const matcher = scheduleUrlPattern.exec(scheduleDataUrl)
  if (matcher) {
    return matcher[1]
  }
  throw new Error(`Unable to extract URL prefix from url ${scheduleDataUrl}`)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function loadJson(url: string) : Promise<any> {
  try {
    return (await axios.get(url)).data
  }
  catch (err) {
    throw new Error(`Unable to load data from ${url} - ${err}`)
  }
}

interface ScheduleEntry {
  Day: string,
  Entry: string,
  Type: string,
  Start: string,
  End: string,
  Duration: string,
  FAQ: string
  Speakers: string
}

interface QueryIndexEntry {
  path: string,
  title: string,
  speakers: string
}
