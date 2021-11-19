import config from 'config'
import { Bite } from './lib'
import { types } from 'pg'
import pgMigrate from 'node-pg-migrate'
import pgPromise from 'pg-promise'

interface DbConfig {
  host: string
  port: number
  user: string
  password: string
  database: string
}

types.setTypeParser(1700, 'text', parseFloat)

const connection = config.get<DbConfig>('db')

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

export const getBites = async (userId: string, since?: Date): Promise<Bite[]> =>
  pgDb.manyOrNone<Bite>(
    `
        SELECT timestamp as ts, portion, weight 
        FROM puraisu 
        WHERE biter = $(userId) 
          AND ($(since) IS NULL OR timestamp > $(since))`,
    { userId, since }
  )

export const addBiter = async (biter: string) => {
  await pgDb.none(
    `
        INSERT INTO megafauna (biter) VALUES ($(biter))
        ON CONFLICT (biter) DO NOTHING 
    `,
    { biter }
  )
}

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
  await pgDb.none(
    `
      INSERT INTO puraisu (type, content, location, info, source, biter,
                           postfestum, coordinates, timestamp, portion,
                           weight, tzoffset)
      SELECT $(type),
             $(content),
             $(location),
             $(info),
             'ppapp',
             $(biter),
             $(postfestum),
             $(coordinates),
             $(timestamp),
             $(portion),
             weight,
             $(tzoffset)
      FROM megafauna
      where biter = $(biter)`,
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
      tzoffset
    }
  )
}
