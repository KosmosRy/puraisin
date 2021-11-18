import dayjs from 'dayjs'

const bodyWater = 0.806
const bodyWaterConstantMale = 0.58
const metabolismConstantMale = 0.015 / 3600
const swedishMultiplier = 1.2
const permillageConvertion = 10
const persW = 1.0

const burnFactor = persW * metabolismConstantMale * permillageConvertion

export const calcCurrentPermillage = (permillage: number, lastBite?: Date): number => {
  if (lastBite) {
    return Math.max(0, permillage - burnFactor * dayjs().diff(lastBite, 'seconds'))
  }
  return 0
}

export const getBFactor = (weight = 85.5) =>
  (bodyWater * permillageConvertion * swedishMultiplier) / (bodyWaterConstantMale * weight)

export const calcTimeTillSober = (currentPct: number) => currentPct / burnFactor

const toDM = (degrees: number, pos: string, neg: string) => {
  let positive = true
  if (degrees < 0) {
    positive = false
    degrees = -degrees
  }

  const degreesFull = degrees.toFixed(0).padStart(3, '0')
  const minutes = ((60 * degrees) % 60).toFixed(3).padStart(2, '0')
  return `${degreesFull}°${minutes}'${positive ? pos : neg}`
}

export const formatDM = (coords?: GeolocationCoordinates | null) => {
  if (coords) {
    const { accuracy, latitude, longitude } = coords
    return `${toDM(latitude, 'N', 'S')} ${toDM(longitude, 'E', 'W')} (±${accuracy.toFixed(0)}m)`
  } else {
    return 'ei paikkatietoja'
  }
}
