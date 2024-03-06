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

export interface CachedBinge extends Pick<Binge, 'permillage' | 'timeTillSober'> {
  lastBite?: string;
  bingeStart?: string;
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
