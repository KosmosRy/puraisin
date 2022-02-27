import { WebClient } from '@slack/web-api'
import pgSession from 'connect-pg-simple'
import 'dotenv/config'
import express from 'express'
import expressSession from 'express-session'
import config from './config'
import { db } from './db'
import index from './indexPage'
import passportController, { getConfiguredPassport } from './passport'

;(async () => {
  const dbClient = await db()
  const SessionStore = pgSession(expressSession)
  const session = {
    store: new SessionStore({
      pgPromise: dbClient,
      createTableIfMissing: true
    }),
    secret: 'HMP FTW',
    cookie: {
      maxAge: 365 * 24 * 60 * 60 * 1000,
      secure: true,
    },
    resave: false,
    saveUninitialized: false,
    proxy: true
  }

  const { botToken, redirectPath, clientId, clientSecret } = config.slack
  const { publicHost, port } = config.server
  const slackClient = new WebClient(botToken)

  const app = express()

  app.set('views', './views')
  app.set('view engine', 'ejs')
  app.set('trust proxy', true)
  app.use(expressSession(session))
  const passport = getConfiguredPassport(publicHost, clientId, clientSecret, redirectPath)
  app.use(passport.initialize())
  app.use(passport.session())
  app.use(express.json())
  app.use('/bundle', express.static('./dist/bundle'))
  app.use('/', express.static('./public'))
  app.use('/', index(slackClient))
  app.use('/auth', passportController)

  app.listen(port, () => {
    console.log(`⚡️ Puraisin is running at port ${port}!`)
  })
})()
