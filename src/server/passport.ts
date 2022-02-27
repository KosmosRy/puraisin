import { Profile } from '@slack/web-api/dist/response/UsersProfileGetResponse'
import express from 'express'
import passport from 'passport'
import { VerifyCallback } from "passport-oauth2"
import SlackStrategy from './passport-slack'

const router = express.Router()

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface User {
      botToken: string
      userToken: string
      id: string
      profile?: Profile
    }
  }
}

type AuthedUser = {
  id: string,
  scope: string,
  access_token: string,
  token_type: 'user'
}

type AuthResults = {
  app_id: string
  authed_user: AuthedUser
  scope: string
  token_type: 'bot'
  access_token: string
  bot_user_ud: string
  team: { id: string; name: string }
}

export const getConfiguredPassport = async (
  publicHost: string,
  clientId: string,
  clientSecret: string,
  redirectPath: string
) => {
  const redirectUri = `${publicHost}${redirectPath}`

  const strategy = new SlackStrategy({
    clientID: clientId,
    clientSecret,
    callbackURL: redirectUri,
    scope: 'users.profile:read',
    userScope: 'chat:write,channels:read,channels:write',
    state: true
  }, (botToken: string, refreshToken: string, authResults: AuthResults, _: unknown, done: VerifyCallback) => {
    const { authed_user: authedUser } = authResults
    done(null, {
      botToken,
      userToken: authedUser.access_token,
      id: authedUser.id
    })
  })


  passport.use(strategy)
  passport.serializeUser((user, done) => {
    done(null, user)
  })
  passport.deserializeUser((user, done) => {
    done(null, user as Express.User)
  })

  router.get('/login', passport.authenticate(strategy))

  router.get(
    '/slack',
    passport.authenticate(strategy, { successRedirect: '/', failureRedirect: '/' })
  )

  router.get('/logout', (req, res) => {
    req.logout()
    req.session.destroy(() => { /* oh well */ })
    res.redirect('/')
  })

  return passport
}

export default router
