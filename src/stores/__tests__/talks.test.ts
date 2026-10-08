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

describe('talks store same-name speakers', () => {
  const sameNameScheduleData = {
    data: [
      { Day: '1', Entry: 'talk-one', Type: 'talk', Start: '', End: '', Duration: '30', FAQ: '', Speakers: '' },
      { Day: '1', Entry: 'talk-two', Type: 'talk', Start: '', End: '', Duration: '30', FAQ: '', Speakers: '' },
      { Day: '1', Entry: 'talk-three', Type: 'talk', Start: '', End: '', Duration: '30', FAQ: '', Speakers: '' },
      { Day: '1', Entry: 'Panel', Type: 'other_rating', Start: '', End: '', Duration: '30', FAQ: '', Speakers: 'nitin-gupta-nitigupt, Jane Doe' }
    ]
  }

  const sameNameQueryIndexData = {
    data: [
      { path: '/2023/' },
      { path: '/speakers/nitin-gupta', title: 'Nitin Gupta' },
      { path: '/speakers/nitin-gupta-nitigupt', title: 'Nitin Gupta' },
      { path: '/speakers/konrad-windszus', title: 'Konrad Windszus' },
      { path: '/2023/schedule/talk-one', title: 'Talk One - adaptTo() 2023', speakers: 'nitin-gupta' },
      { path: '/2023/schedule/talk-two', title: 'Talk Two - adaptTo() 2023', speakers: 'nitin-gupta-nitigupt, Konrad Windszus' },
      { path: '/2023/schedule/talk-three', title: 'Talk Three - adaptTo() 2023', speakers: 'Konrad Windszus,Unknown Speaker' }
    ]
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.stubEnv('VITE_SCHEDULE_DATA_URL', 'https://adapt.to/2023/schedule-data.json')
    vi.stubEnv('VITE_QUERY_INDEX_URL', 'https://adapt.to/query-index.json')
    vi.mocked(axios.get).mockImplementation((url: string) => {
      if (url.includes('schedule-data')) {
        return Promise.resolve({ data: sameNameScheduleData })
      }
      return Promise.resolve({ data: sameNameQueryIndexData })
    })
  })

  test('resolves speaker document names to display names', async () => {
    const store = useTalksStore()
    await store.fill()

    const speakersById = (id: string) => store.talks.find(talk => talk.id === id)?.speakers
    expect(speakersById('2023-talk-one')).to.eq('Nitin Gupta')
    expect(speakersById('2023-talk-two')).to.eq('Nitin Gupta, Konrad Windszus')
    expect(speakersById('2023-talk-three')).to.eq('Konrad Windszus, Unknown Speaker')
    expect(speakersById('2023-panel')).to.eq('Nitin Gupta, Jane Doe')
  })
})
