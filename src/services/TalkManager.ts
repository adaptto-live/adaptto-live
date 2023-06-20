import { useTalksStore, type Talk } from "@/stores/talks"
import type Day from "./Day"

export default class TalkManager {

  private _talks : Talk[]
  private _days : Day[]|undefined

  public constructor() {
    this._talks = useTalksStore().talks
  }

  public get talks() : readonly Talk[] {
    return this._talks
  }

  public get days() : readonly Day[] {
    if (!this._days) {
      const dayNumbers = Array.from(this.talks.reduce((set, talk) => set.add(talk.day), new Set<number>()))
      dayNumbers.sort((a,b) => a - b)
      this._days = dayNumbers.map(day => ({ day, talks: this.talks.filter(talk => talk.day == day) }))  
    }
    return this._days
  }

  public getDay(day: number) : Day|undefined {
    return this.days.find(item => item.day == day)
  }

  public getTalk(id?: string) : Talk|undefined {
    return this.talks.find(item => item.id == id)
  }

  public isAfter(talk1: Talk, talk2: Talk) {
    const index1 = this._talks.findIndex(item => item.id==talk1.id)
    const index2 = this._talks.findIndex(item => item.id==talk2.id)
    return index1 > index2
  }

}
