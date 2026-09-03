import { beforeEach, describe, expect, test, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import axios from 'axios'
import { useTalksStore } from '../talks'

vi.mock('axios', () => ({
  default: {
    get: vi.fn()
  }
}))

const scheduleData = {
  data: [
    { Day: '1', Entry: 'Talk One', Type: 'talk', Start: '', End: '', Duration: '30', FAQ: '', Speakers: '' },
    { Day: '1', Entry: 'Coffee Break', Type: 'break', Start: '', End: '', Duration: '15', FAQ: '', Speakers: '' },
    { Day: '1', Entry: 'Registration', Type: 'other', Start: '', End: '', Duration: '60', FAQ: '', Speakers: '' },
    { Day: '1', Entry: 'Lunch Break', Type: 'break', Start: '', End: '', Duration: '60', FAQ: '', Speakers: '' },
    { Day: '2', Entry: 'Morning Break', Type: 'break', Start: '', End: '', Duration: '15', FAQ: '', Speakers: '' }
  ]
}

const queryIndexData = {
  data: [
    { path: '/2023/schedule/Talk One', title: 'Talk One - adaptTo() 2023', speakers: 'Speaker A' }
  ]
}

describe('talks store break/other handling', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.stubEnv('VITE_SCHEDULE_DATA_URL', 'https://adapt.to/2023/schedule-data.json')
    vi.stubEnv('VITE_QUERY_INDEX_URL', 'https://adapt.to/2023/query-index.json')
    vi.mocked(axios.get).mockImplementation((url: string) => {
      if (url.includes('schedule-data')) {
        return Promise.resolve({ data: scheduleData })
      }
      return Promise.resolve({ data: queryIndexData })
    })
  })

  test('generates stable break/other ids with shared per-day ordinals', async () => {
    const store = useTalksStore()
    await store.fill()

    const breaks = store.talks.filter(talk => talk.isBreakOther)
    expect(breaks.map(b => b.id)).to.deep.eq([
      '2023-break-other-day-1-1',
      '2023-break-other-day-1-2',
      '2023-break-other-day-1-3',
      '2023-break-other-day-2-1'
    ])
  })

  test('break and other entries use the entry text as title and carry no url', async () => {
    const store = useTalksStore()
    await store.fill()

    const coffeeBreak = store.talks.find(talk => talk.id === '2023-break-other-day-1-1')
    expect(coffeeBreak?.title).to.eq('Coffee Break')
    expect(coffeeBreak?.duration).to.eq(15)
    expect(coffeeBreak?.url).to.undefined
    expect(coffeeBreak?.isBreakOther).to.true

    const registration = store.talks.find(talk => talk.id === '2023-break-other-day-1-2')
    expect(registration?.title).to.eq('Registration')
    expect(registration?.duration).to.eq(60)
    expect(registration?.url).to.undefined
    expect(registration?.isBreakOther).to.true
  })

  test('breaks and others are kept in schedule order alongside talks', async () => {
    const store = useTalksStore()
    await store.fill()

    const nonLobbyIds = store.talks.filter(talk => !talk.lobby).map(talk => talk.id)
    expect(nonLobbyIds).to.deep.eq([
      '2023-talk-one',
      '2023-break-other-day-1-1',
      '2023-break-other-day-1-2',
      '2023-break-other-day-1-3',
      '2023-break-other-day-2-1'
    ])
  })
})
