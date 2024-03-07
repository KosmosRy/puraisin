export interface AppInfo {
  realName: string;
  avatar: string;
}

export interface Binge {
  permillage: number;
  lastBite?: Date;
  bingeStart?: Date;
  timeTillSober?: number;
}

export interface BiteInfo {
  coordinates?: GeolocationCoordinates | null;
  content: string;
  portion: number;
  postfestum: boolean;
  pftime?: number;
  location: string;
  customLocation?: string;
  info: string;
  tzOffset: string;
}

export interface Bite {
  id: number;
  ts: Date;
  permillage: number;
  portion: number;
  weight: number;
  bingeStart?: Date;
}

export interface Biter {
  biter: string;
  weight: number;
  displayName: string;
}
