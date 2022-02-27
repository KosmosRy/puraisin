export type ServerConfig = {
  publicHost: string
  port: number
  sessionSecret: string
}

export type SlackConfig = {
  botToken: string
  redirectPath: string
  clientId: string
  clientSecret: string
  channelId: string
}

export type DbConfig = {
  host: string
  port: number
  user: string
  password: string
  database: string
}

export type Config = {
  server: ServerConfig
  slack: SlackConfig
  db: DbConfig
}

const parseEnv = (env: string, defaultVal?: string): string => {
  const value = process.env[env]
  if (value === undefined) {
    if (defaultVal) {
      return defaultVal
    }
    throw new Error(`Missing required env variable ${env}`)
  }
  return value
}

const parseNumber = (env: string, defaultVal?: number) => {
  const value = parseEnv(env)
  const numVal = parseInt(value, 10)
  if (isNaN(numVal)) {
    if (defaultVal !== undefined) {
      return defaultVal
    }
    throw new Error(`Invalid value for env variable ${env}: number expected`)
  }
  return numVal
}

const config: Config = {
  server: {
    publicHost: parseEnv('PUBLIC_HOST'),
    port: parseNumber('PORT', 3000),
    sessionSecret: parseEnv('SESSION_SECRET')
  },
  slack: {
    botToken: parseEnv('BOT_TOKEN'),
    redirectPath: parseEnv('REDIRECT_PATH', '/auth/slack'),
    clientId: parseEnv('CLIENT_ID'),
    clientSecret: parseEnv('CLIENT_SECRET'),
    channelId: parseEnv('CHANNEL_ID', 'G0J88FAV8')
  },
  db: {
    host: parseEnv('DB_HOST', 'localhost'),
    port: parseNumber('DB_PORT', 5432),
    user: parseEnv('DB_USER', 'puraisin'),
    password: parseEnv('DB_PASSWORD', 'puraisin'),
    database: parseEnv('DB', 'puraisin')
  }
} as const

export default config
