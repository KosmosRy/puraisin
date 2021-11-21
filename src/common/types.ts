export interface AppInfo {
  realName: string
  avatar: string
}

export interface Binge {
  permillage: number
  lastBite?: Date
  bingeStart?: Date
  timeTillSober?: number
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
  tzOffset: string
}

export interface SlackConfig {
  redirect_path: string
  channelId: string
  signingSecret: string
  botToken: string
  appToken: string
  client_id: string
  client_secret: string
}
