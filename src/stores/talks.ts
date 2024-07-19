import { defineStore } from 'pinia'
import axios from 'axios'

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
}

export const useTalksStore = defineStore('talks', {
  state: () => {
    return {
      talks: [] as Talk[],
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
  const result = [] as Talk[]

  scheduleEntries.filter(entry => entry.Type == 'talk').forEach(entry => {
    const id = `${year}-${entry.Entry}`
    const day = parseInt(entry.Day)
    const path = `/${year}/schedule/${entry.Entry}`
    const queryIndexEntry = queryIndexEntries.find(entry => entry.path == path)
    if (queryIndexEntry) {
      let title = queryIndexEntry.title
      const titleMatcher = titleWithoutSuffixPattern.exec(title)
      if (titleMatcher) {
        title = titleMatcher[1]
      }
      const speakers = queryIndexEntry.speakers
      const startTime = parseFloatOrUndefined(entry.Start)
      const endTime = parseFloatOrUndefined(entry.End)
      const duration = parseIntOrUndefined(entry.Duration)
      const durationFAQ = parseIntOrUndefined(entry.FAQ)
      const url = `${urlPrefix}${path}`
      result.push({id, day, title, speakers, startTime, endTime, duration, durationFAQ, url})
    }
  })

  return addDailyLobbyTalks(result)
}

function parseFloatOrUndefined(value : string) : number|undefined {
  const result = parseFloat(value)
  return isNaN(result) ? undefined : result
}

function parseIntOrUndefined(value : string) : number|undefined {
  const result = parseInt(value, 10)
  return isNaN(result) ? undefined : result
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
const titleWithoutSuffixPattern = /^(.+)\s+-\s+adaptTo\(\)\s+\d{4}\s*$/

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
}

interface QueryIndexEntry {
  path: string,
  title: string,
  speakers: string
}
