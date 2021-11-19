import { getBites, insertPuraisu } from './db'
import { calcCurrentPermillage, getBFactor } from '../common/utils'
import { Binge, BiteInfo, SlackConfig } from '../common/types'
import dayjs from 'dayjs'
import { WebClient } from '@slack/web-api'
import config from 'config'

export interface Bite {
  ts: Date
  portion?: number
  weight?: number
}

const baseBinge = (): Binge => ({
  permillage: 0,
  lastBite: undefined,
  bingeStart: undefined
})

const { channelId } = config.get<SlackConfig>('slack')

const processBite = (binge: Binge, bite: Bite): Binge => {
  let { permillage, lastBite, bingeStart } = binge
  const { ts, portion, weight } = bite
  if (lastBite) {
    permillage = calcCurrentPermillage(permillage, lastBite)
  }
  if (portion) {
    if (permillage === 0) {
      bingeStart = ts
    }
    permillage += getBFactor(weight) * portion
    lastBite = ts
  }
  if (permillage === 0) {
    bingeStart = undefined
  }
  return { permillage, lastBite, bingeStart }
}

const processBinge = (bites: Bite[]): Binge => {
  return bites.reduce((binge, bite) => processBite(binge, bite), baseBinge())
}

export const getUserStatus = (userId: string): Promise<Binge> => getBites(userId).then(processBinge)

export const submitBite = async (user: Express.User, biteInfo: BiteInfo, client?: WebClient) => {
  const { id: userId, token } = user
  let currentPermillage = await getUserStatus(userId).then((status) => status.permillage)

  /*
  päästetään läpi ilman sanitointia, slack ja express sanitoivat syötteet automaattisesti
  ja sql-injektiot vältetään prepared statementeilla. Pitää muistaa sitten itse sanitoida
  arvot tarpeen mukaan
  */
  const {
    content,
    info,
    coordinates: coords,
    postfestum,
    pftime = 0,
    tzOffset,
    portion,
    location: loc,
    customLocation
  } = biteInfo
  const type = currentPermillage > 0 ? 'p' : 'ep'
  const ts = (postfestum ? dayjs().subtract(pftime, 'minutes') : dayjs()).toDate()
  const location = loc === 'else' ? customLocation : loc
  const alcoholW = Math.round(portion * 12)
  const coordinates = !postfestum ? coords || null : null

  await insertPuraisu(
    userId,
    type,
    content,
    location || 'Terra incognita',
    info,
    postfestum,
    coordinates,
    portion,
    ts,
    tzOffset
  )

  const binge = await getUserStatus(userId)
  currentPermillage = binge.permillage

  if (client) {
    let coordLoc = ''
    if (coordinates) {
      const { latitude, longitude, accuracy } = coordinates
      const gmapUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
      coordLoc = ` (<${gmapUrl}|${latitude.toFixed(4)},${longitude.toFixed(
        4
      )}>\u00A0±${accuracy.toFixed(0)}m)`
    }
    const typePostfix = postfestum ? `-postfestum (${pftime} min sitten)` : ''
    const slackMsg = `${type}${typePostfix};${content}\u00A0(${alcoholW}\u00A0g);${location}${coordLoc};${currentPermillage
      .toFixed(2)
      .replace('.', ',')}\u00A0‰${info ? ';' + info : ''}`
    await client.chat.postMessage({
      channel: channelId,
      text: `\u{200B}${slackMsg}`,
      unfurl_links: false,
      as_user: true,
      token
    })
  }

  return binge
}
