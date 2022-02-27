import { WebClient } from '@slack/web-api'
import express from 'express'
import manifest from '../../dist/bundle/manifest.json'
import { AppInfo, Binge, BiteInfo } from '../common/types'
import { getUserStatus, submitBite } from './lib'
import { appHtml } from './ssr'

const index = (client: WebClient) => {
  const router = express.Router()

  router.get('/', async (req, res, next) => {
    if (req.isAuthenticated()) {
      try {
        const { id, botToken } = req.user
        const profile = await client.users.profile
          .get({
            token: botToken,
            user: id
          })
          .then((res) => res.profile)

        if (!profile) {
          res.sendStatus(401)
          return
        }
        req.user.profile = profile
        const { display_name, real_name, image_512: picture } = profile
        const name = display_name || real_name

        const appInfo: AppInfo = {
          realName: name || '',
          avatar: picture || ''
        }

        const userStatus: Binge = await getUserStatus(req.user.id)

        const { html, styles } = appHtml({ appInfo, userStatus })

        res.render('index', {
          appInfo: JSON.stringify(appInfo),
          userStatus: JSON.stringify(userStatus),
          bundle: manifest['index.js'],
          html,
          styles
        })
      } catch (err) {
        next(err)
      }
    } else {
      res.render('login')
    }
  })

  router.get('/user-status', async (req, res, next) => {
    if (req.isAuthenticated()) {
      try {
        const userStatus = await getUserStatus(req.user.id)
        res.json(userStatus)
      } catch (err) {
        next(err)
      }
    } else {
      res.sendStatus(401)
    }
  })

  router.post('/submit-data', async (req, res, next) => {
    if (req.isAuthenticated()) {
      try {
        const currentBinge = await submitBite(req.user, req.body as BiteInfo, client)
        res.json(currentBinge)
      } catch (err) {
        next(err)
      }
    } else {
      res.sendStatus(401)
    }
  })

  return router
}

export default index
