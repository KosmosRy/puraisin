import { App, ExpressReceiver } from '@slack/bolt'
import config from 'config'
import expressSession from 'express-session'
import index from './indexPage'
import passportController, { getConfiguredPassport } from './passport'
import express from 'express'
import pgSession from 'connect-pg-simple'
import { db } from './db'

const { signingSecret, botToken, appToken } = config.get('slack')

const receiver = new ExpressReceiver({
  signingSecret
})

const app = new App({
  token: botToken,
  receiver,
  appToken
})

app.message('hello', async ({ event, say }) => {
  // say() sends a message to the channel where the event was triggered
  if ('user' in event) {
    await say(`Hey there <@${event.user}>!`)
  }
})

const { router } = receiver

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

  receiver.app.set('views', './views')
  receiver.app.set('view engine', 'ejs')
  router.use(expressSession(session))
  const passport = await getConfiguredPassport()
  router.use(passport.initialize())
  router.use(passport.session())
  router.use('/bundle', express.static('./dist/bundle'))
  router.use('/', express.static('./public'))
  router.use('/', index(app.client))
  router.use('/auth', passportController)

  const { port } = config.get('server')
  await app.start(port)
  console.log('⚡️ Bolt app is running!')
})()

router.get('/ping', async (req, res) => {
  const response = await app.client.chat.postMessage({
    token: botToken,
    channel: 'testiryhma',
    text: 'Ping'
  })
  console.log(response)
  res.sendStatus(204)
})
