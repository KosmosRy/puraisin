import express from 'express'
import passport from 'passport'
import { Issuer, Strategy, TokenSet, UserinfoResponse } from 'openid-client'
import config from 'config'
import { addBiter } from './db'

const router = express.Router()

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface User {
      token: string
      id: string
    }
  }
}

export const getConfiguredPassport = async () => {
  const { client_id, client_secret, redirect_path } = config.get('slack')
  const { publicHost } = config.get('server')
  const redirectUri = `${publicHost}${redirect_path}`
  const issuer = await Issuer.discover('https://slack.com')
  const client = new issuer.Client({
    client_id,
    client_secret,
    redirect_uris: [redirectUri],
    response_types: ['code']
  })
  const strategy = new Strategy<Express.User>(
    {
      client,
      params: {
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid profile email'
      },
      usePKCE: 'S256'
    },
    (
      tokenSet: TokenSet,
      userInfo: UserinfoResponse<Record<string, unknown>, Record<string, unknown>>,
      done: (error: unknown, user?: Express.User) => void
    ) => {
      if (!tokenSet.access_token) {
        done(new Error('No access token'))
      } else {
        done(null, {
          token: tokenSet.access_token,
          id: userInfo.sub
        })
      }
    }
  )

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
    passport.authenticate(strategy, { failureRedirect: '/' }),
    async (req, res) => {
      if (req.user?.id) {
        await addBiter(req.user.id)
      }
      res.redirect('/')
    }
  )

  router.get('/logout', (req, res) => {
    req.logout()
    res.redirect('/')
  })

  return passport
}

export default router
