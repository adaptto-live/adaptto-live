export default interface Message {
  id: string
  date: Date
  userid: string
  username?: string
  text: string
  replyTo?: string
}
