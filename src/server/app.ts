import { App, ExpressReceiver } from '@slack/bolt'
import config from 'config'
import pgSession from 'connect-pg-simple'
import express from 'express'
import expressSession from 'express-session'
import { db, getSlackConf } from './db'
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

  const { organization, redirectPath } = config.get('slack')
  const { publicHost } = config.get('server')
  const { signing_secret, bot_token, app_token, client_id, client_secret } = await getSlackConf(
    organization
  )
  const receiver = new ExpressReceiver({
    signingSecret: signing_secret
  })
  const app = new App({
    token: bot_token,
    receiver,
    appToken: app_token
  })
  const { router } = receiver

  receiver.app.set('views', './views')
  receiver.app.set('view engine', 'ejs')
  router.use(expressSession(session))
  const passport = await getConfiguredPassport(publicHost, client_id, client_secret, redirectPath)
  router.use(passport.initialize())
  router.use(passport.session())
  router.use(express.json())
  router.use('/bundle', express.static('./dist/bundle'))
  router.use('/', express.static('./public'))
  router.use('/', index(app.client))
  router.use('/auth', passportController)

  router.get('/ping', async (req, res) => {
    const response = await app.client.chat.postMessage({
      token: bot_token,
      channel: 'testiryhma',
      text: 'Ping'
    })
    console.log(response)
    res.sendStatus(204)
  })

  const { port } = config.get('server')
  await app.start(port)
  console.log('⚡️ Bolt app is running!')
})()
