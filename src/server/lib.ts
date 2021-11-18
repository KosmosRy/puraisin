import { getBites } from './db'
import { calcTimeTillSober, calcCurrentPermillage, getBFactor } from '../common/utils'

export interface Bite {
  ts: Date
  portion?: number
  weight?: number
}

export interface Binge {
  currentPct: number
  timeTillSober: number
  lastBite?: Date
  bingeStart?: Date
}

const baseBinge = (): Binge => ({
  currentPct: 0,
  timeTillSober: 0,
  lastBite: undefined,
  bingeStart: undefined
})

const processBite = (binge: Binge, bite: Bite): Binge => {
  let { currentPct, lastBite, bingeStart } = binge
  const { ts, portion, weight } = bite
  if (lastBite) {
    currentPct = calcCurrentPermillage(currentPct, lastBite)
  }
  if (portion) {
    if (currentPct === 0) {
      bingeStart = ts
    }
    currentPct += getBFactor(weight) * portion
    lastBite = ts
  }
  if (currentPct === 0) {
    bingeStart = undefined
  }
  return { currentPct, timeTillSober: calcTimeTillSober(currentPct), lastBite, bingeStart }
}

export const currentStatus = (prevBite = baseBinge()): Binge =>
  processBite(prevBite, { ts: new Date() })

export const processBinge = (bites: Bite[]): Binge => {
  return bites.reduce((prev, curr) => processBite(prev, curr), baseBinge())
}

export const getUserStatus = async (userId: string) => {
  const pb = await getBites(userId).then((b) => processBinge(b))
  return {
    permillage: pb.currentPct,
    lastBite: pb.lastBite,
    bingeStart: pb.bingeStart
  }
}
