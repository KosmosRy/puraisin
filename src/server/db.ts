import pgMigrate from 'node-pg-migrate'
import { types } from 'pg'
import pgPromise from 'pg-promise'
import config from './config'
import { Bite, Biter } from './lib'

types.setTypeParser(1700, 'text', parseFloat)

const connection = config.db

const migration = async () => {
  await pgMigrate({
    databaseUrl: connection,
    migrationsTable: 'pgmigrations',
    direction: 'up',
    count: Infinity,
    dir: './migrations'
  })
}

const pgDb = pgPromise()(connection)

export const db = async () => {
  await migration()
  console.log('DB migration done')
  return pgDb
}

export const getWeight = async (userId: string): Promise<number> =>
  pgDb
    .one<{ weight: number }>(
      `SELECT weight
     FROM megafauna
     WHERE biter = $(userId)`,
      { userId }
    )
    .then(({ weight }) => weight)

export const getBites = async (userId: string, since?: Date): Promise<Bite[]> =>
  pgDb.manyOrNone<Bite>(
    `
        SELECT id, timestamp as ts, portion, weight, permillage 
        FROM puraisu 
        WHERE biter = $(userId) 
          AND ($(since) IS NULL OR timestamp > $(since))
        ORDER BY timestamp`,
    { userId, since }
  )

export const getPreviousBite = async (
  userId: string,
  ts: Date = new Date()
): Promise<Bite | null> =>
  pgDb.oneOrNone<Bite>(
    `
        SELECT id, timestamp as ts, portion, weight, permillage
        FROM puraisu
        WHERE biter = $(userId) AND timestamp < $(ts)
        ORDER BY timestamp desc
        LIMIT 1`,
    { userId, ts }
  )

export const getLastBingeStart = async (userId: string): Promise<Date | undefined> =>
  pgDb
    .oneOrNone<{ bingestart: Date }>(
      `
        SELECT max(timestamp) as bingestart 
        FROM puraisu
        WHERE biter = $(userId) AND type = 'ep'`,
      { userId }
    )
    .then((res) => res?.bingestart)

export const addBiter = async (biter: string, name?: string) => {
  await pgDb.none(
    `
        INSERT INTO megafauna (biter, displayname) VALUES ($(biter), $(name))
        ON CONFLICT (biter) DO NOTHING 
    `,
    { biter, name: name ?? null }
  )
}

export const getMegafauna = async () => {
  return pgDb.map<Biter>(
    `
    SELECT biter, weight, displayname FROM megafauna`,
    [],
    ({ biter, weight, displayname }) => ({ biter, weight, displayName: displayname })
  )
}

export const updatePuraisu = async (id: number, type: string, permillage: number) => {
  await pgDb.none(
    `
        UPDATE puraisu 
        SET type = $(type), permillage = $(permillage)
        WHERE id = $(id)`,
    { id, type, permillage }
  )
}

export const insertPuraisu = async (
  biter: string,
  type: string,
  content: string,
  location: string,
  info: string,
  postfestum: boolean,
  coordinates: GeolocationCoordinates | null,
  portion: number,
  permillage: number,
  timestamp = new Date(),
  weight: number,
  tzoffset?: string
): Promise<Bite> => {
  const { id } = await pgDb.one<{ id: number }>(
    `
        INSERT INTO puraisu (type, content, location, info, source, biter,
                             postfestum, coordinates, timestamp, portion,
                             permillage, weight, tzoffset)
        VALUES ($(type), $(content), $(location), $(info), 'ppapp', $(biter),
                $(postfestum), $(coordinates), $(timestamp), $(portion),
                $(permillage), $(weight), $(tzoffset))
        RETURNING id`,
    {
      type,
      content,
      location,
      info,
      biter,
      postfestum,
      coordinates,
      timestamp,
      portion,
      permillage,
      weight,
      tzoffset
    }
  )
  return {
    id,
    permillage,
    ts: timestamp,
    portion,
    weight
  }
}
