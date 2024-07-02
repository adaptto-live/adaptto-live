import { expect, test } from 'vitest'
import type { Talk } from '@/stores/talks'
import { convertSheetDateValue, formatTalkDuration, formatTalkTime, formatTalkTimeDuration, formatTime } from '../datetime'

test('formatTime', () => {
  expect(formatTime(new Date(Date.UTC(2021, 5, 15, 12, 10)))).to.eq('12:10')
})

test('convertSheetDateValue', () => {
  expect(convertSheetDateValue(44102.416666666664).toISOString()).to.eq('2020-09-28T10:00:00.000Z')
  expect(convertSheetDateValue(44466.46527777778).toISOString()).to.eq('2021-09-27T11:10:00.000Z')
})

const talk : Talk = { id: 'talk-1', title: 'Talk 1', day: 1,
  startTime: 44102.416666666664, endTime: 44466.46527777778,
  duration: 30, durationFAQ: 10 }

const talkNoTimeDuration : Talk = { id: 'talk-1', title: 'Talk 1', day: 1 }
 
test('formatTalkTime', () => {
  expect(formatTalkTime(talk)).to.eq('10:00 - 11:10')
  expect(formatTalkTime(talkNoTimeDuration)).to.undefined
})

test('formatTalkDuration', () => {
  expect(formatTalkDuration(talk)).to.eq('30 min + 10 min FAQ')
  expect(formatTalkDuration(talkNoTimeDuration)).to.undefined
})

test('formatTalkTimeDuration', () => {
  expect(formatTalkTimeDuration(talk)).to.eq('10:00 - 11:10 (30 min + 10 min FAQ)')
  expect(formatTalkTimeDuration(talkNoTimeDuration)).to.undefined
})
