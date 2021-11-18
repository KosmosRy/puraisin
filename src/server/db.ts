import knex from 'knex'
import config from 'config'
import { Bite } from './lib'
import { types } from 'pg'

interface Puraisu {
  id: string
  type: string
  content: string
  location: string
  info?: string
  source: string
  biter: string
  timestamp: Date
  postfestum: boolean
  coordinates?: GeolocationCoordinates
  portion: number
  weight: number
  tzoffset?: string
}

interface Megafauna {
  biter: string
  weight: number
  displayName?: string
}

types.setTypeParser(1700, 'text', parseFloat)

const connection = config.get<Record<string, unknown>>('db')
const knexDb = knex({
  client: 'pg',
  connection,
  migrations: {
    tableName: 'migrations'
  }
})

const migration = knexDb.migrate.latest().then(() => console.log('DB migration done'))

export const db = () => migration.then(() => knexDb)

const Puraisu = () => knexDb<Puraisu>('puraisu')
const Megafauna = () => knexDb<Megafauna>('megafauna')

export const getBites = async (userId: string, since?: Date): Promise<Bite[]> => {
  let query = Puraisu().where('biter', userId)
  if (since) {
    query = query.andWhere('timestamp', '>', since)
  }

  const rows = await query.select(knexDb.ref('timestamp').as('ts'), 'portion', 'weight')
  return rows.map((bite) => bite as Bite)
}

const biterWeight = (id: string) =>
  Megafauna()
    .where('biter', id)
    .first('weight')
    .then((res) => res?.weight)

export const insertPuraisu = async (
  biter: string,
  type: string,
  content: string,
  location: string,
  info: string,
  postfestum: boolean,
  coordinates: GeolocationCoordinates,
  portion: number,
  timestamp = new Date(),
  tzoffset?: string
) => {
  const weight = await biterWeight(biter)
  Puraisu().insert({
    type,
    content,
    location,
    info,
    source: 'ppapp',
    biter,
    postfestum,
    coordinates,
    portion,
    timestamp,
    weight,
    tzoffset
  })
}
