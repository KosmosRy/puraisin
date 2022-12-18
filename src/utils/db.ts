import pgMigrate from 'node-pg-migrate';
import { types } from 'pg';
import pgPromise from 'pg-promise';
import config from './config';
import { Bite, Biter } from './lib';

const pgp = pgPromise();
const connection = config.db;

// generic singleton creator:
async function createSingleton<T>(name: string, create: () => Promise<T>): Promise<T> {
  const s = Symbol.for(name);
  let scope = (global as any)[s];
  if (!scope) {
    scope = await create().then((s) => ({ ...s }));
    (global as any)[s] = scope;
  }
  return scope;
}

interface IDatabaseScope {
  db: pgPromise.IDatabase<any>;
  pgp: pgPromise.IMain;
}

const migration = async () => {
  if (process.env.NEXT_PHASE !== 'phase-production-build') {
    await pgMigrate({
      databaseUrl: connection,
      migrationsTable: 'pgmigrations',
      direction: 'up',
      count: Infinity,
      dir: './migrations',
    });
  }
};

const getDB = async () => {
  return createSingleton<IDatabaseScope>('my-app-db-space', async () => {
    await migration();
    return {
      db: pgp(connection),
      pgp,
    };
  });
};

types.setTypeParser(1700, 'text', parseFloat);

const withDb = async <T>(dbFn: (pgDb: pgPromise.IDatabase<any>) => Promise<T>) =>
  getDB().then(async ({ db }) => dbFn(db));

export const getWeight = async (userId: string): Promise<number> =>
  withDb(async (pgDb) =>
    pgDb
      .one<{ weight: number }>(
        `SELECT weight
       FROM megafauna
       WHERE biter = $(userId)`,
        { userId },
      )
      .then(({ weight }) => weight),
  );

export const getBites = async (userId: string, since?: Date): Promise<Bite[]> =>
  withDb(async (pgDb) =>
    pgDb.manyOrNone<Bite>(
      `
        SELECT id, timestamp as ts, portion, weight, permillage
        FROM puraisu
        WHERE biter = $(userId)
          AND ($(since) IS NULL OR timestamp > $(since))
        ORDER BY timestamp`,
      { userId, since },
    ),
  );

export const getPreviousBite = async (
  userId: string,
  ts: Date = new Date(),
): Promise<Bite | null> =>
  withDb(async (pgDb) =>
    pgDb.oneOrNone<Bite>(
      `
        SELECT id, timestamp as ts, portion, weight, permillage
        FROM puraisu
        WHERE biter = $(userId)
          AND timestamp < $(ts)
        ORDER BY timestamp desc
        LIMIT 1`,
      { userId, ts },
    ),
  );

export const getLastBingeStart = async (userId: string): Promise<Date | undefined> =>
  withDb(async (pgDb) =>
    pgDb
      .oneOrNone<{ bingestart: Date }>(
        `
          SELECT max(timestamp) as bingestart
          FROM puraisu
          WHERE biter = $(userId)
            AND type = 'ep'`,
        { userId },
      )
      .then((res) => res?.bingestart),
  );

export const addBiter = async (biter: string, name?: string): Promise<void> => {
  await withDb(async (pgDb) =>
    pgDb.none(
      `
          INSERT INTO megafauna (biter, displayname)
          VALUES ($(biter), $(name))
          ON CONFLICT (biter) DO ${
            name === null ? 'NOTHING' : 'UPDATE SET displayname = excluded.displayname'
          }
      `,
      { biter, name: name ?? null },
    ),
  );
};

export const getMegafauna = async (): Promise<Biter[]> => {
  return withDb(async (pgDb) =>
    pgDb.map<Biter>(
      `
        SELECT biter, weight, displayname
        FROM megafauna`,
      [],
      ({ biter, weight, displayname }) => ({ biter, weight, displayName: displayname }),
    ),
  );
};

export const updatePuraisu = async (
  id: number,
  type: string,
  permillage: number,
): Promise<void> => {
  await withDb(async (pgDb) =>
    pgDb.none(
      `
        UPDATE puraisu
        SET type = $(type),
            permillage = $(permillage)
        WHERE id = $(id)`,
      { id, type, permillage },
    ),
  );
};

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
  tzoffset?: string,
): Promise<Bite> => {
  const { id } = await withDb(async (pgDb) =>
    pgDb.one<{ id: number }>(
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
        tzoffset,
      },
    ),
  );
  return {
    id,
    permillage,
    ts: timestamp,
    portion,
    weight,
  };
};
