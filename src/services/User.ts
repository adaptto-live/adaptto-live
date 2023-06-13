export default interface User {
  id: string
  code: string
  username: string
  admin: boolean
  blocked: boolean
  created: Date
  updated: Date
}
