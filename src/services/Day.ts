import type { Talk } from '@/stores/talks'

export default interface Day {
  day: number,
  date?: Date,
  talks: Talk[]
}
