export interface AppInfo {
  realName: string
  avatar: string
}

export interface UserStatus {
  permillage: number
  lastBite?: Date
  bingeStart?: Date
}

export interface BiteInfo {
  coordinates?: GeolocationCoordinates | null
  content: string
  portion: number
  postfestum: boolean
  pftime?: number
  location: string
  customLocation?: string
  info: string
}
