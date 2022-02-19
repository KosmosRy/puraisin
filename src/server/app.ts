import { WebClient } from '@slack/web-api'
import config from 'config'
import pgSession from 'connect-pg-simple'
import express from 'express'
import expressSession from 'express-session'
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
      maxAge: 365 * 24 * 60 * 60 * 1000
      // secure,
    },
    resave: false,
    saveUninitialized: false
  }

  const { botToken, redirectPath, clientId, clientSecret } = config.get('slack')
  const { publicHost } = config.get('server')
  const slackClient = new WebClient(botToken)

  const app = express()

  app.set('views', './views')
  app.set('view engine', 'ejs')
  app.use(expressSession(session))
  const passport = await getConfiguredPassport(publicHost, clientId, clientSecret, redirectPath)
  app.use(passport.initialize())
  app.use(passport.session())
  app.use(express.json())
  app.use('/bundle', express.static('./dist/bundle'))
  app.use('/', express.static('./public'))
  app.use('/', index(slackClient))
  app.use('/auth', passportController)

  app.get('/ping', async (req, res) => {
    const response = await slackClient.chat.postMessage({
      channel: 'testiryhma',
      text: 'Ping'
    })
    console.log(response)
    res.sendStatus(204)
  })

  const { port } = config.get('server')
  app.listen(port, () => {
    console.log(`⚡️ Puraisin is running at port ${port}!`)
  })
})()
