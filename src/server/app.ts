import { App, ExpressReceiver } from '@slack/bolt'
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

  const { signingSecret, botToken, appToken, redirectPath, clientId, clientSecret } =
    config.get('slack')
  const { publicHost } = config.get('server')
  const receiver = new ExpressReceiver({
    signingSecret
  })
  const app = new App({
    token: botToken,
    receiver,
    appToken
  })
  const { router } = receiver

  receiver.app.set('views', './views')
  receiver.app.set('view engine', 'ejs')
  router.use(expressSession(session))
  const passport = await getConfiguredPassport(publicHost, clientId, clientSecret, redirectPath)
  router.use(passport.initialize())
  router.use(passport.session())
  router.use(express.json())
  router.use('/bundle', express.static('./dist/bundle'))
  router.use('/', express.static('./public'))
  router.use('/', index(app.client))
  router.use('/auth', passportController)

  router.get('/ping', async (req, res) => {
    const response = await app.client.chat.postMessage({
      token: botToken,
      channel: 'testiryhma',
      text: 'Ping'
    })
    console.log(response)
    res.sendStatus(204)
  })

  const { port } = config.get('server')
  await app.start(port)
  console.log(`⚡️ Bolt app is running at port ${port}!`)
})()
