export default interface Message {
  id: string
  date: Date
  userid: string
  username?: string
  text: string
  entryIndex?: number
  replyTo?: string
  highlight?: boolean
  answered?: boolean
  likeUserIds?: string[]
}
