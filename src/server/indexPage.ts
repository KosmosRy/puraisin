import express from 'express'
import { WebClient } from '@slack/web-api'
import manifest from '../../dist/bundle/manifest.json'
import { appHtml } from './ssr'
import { AppInfo, BiteInfo, Binge } from '../common/types'
import { getUserStatus, submitBite } from './lib'

const index = (client: WebClient) => {
  const router = express.Router()

  router.get('/', async (req, res) => {
    if (req.isAuthenticated()) {
      const userInfo = await client.openid.connect.userInfo({
        token: req.user.token
      })
      const name = userInfo.name
      const picture = userInfo['https://slack.com/user_image_48']

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
    } else {
      res.render('login')
    }
  })

  router.get('/user-status', async (req, res) => {
    if (req.isAuthenticated()) {
      const userStatus = await getUserStatus(req.user.id)
      res.json(userStatus)
    } else {
      res.sendStatus(401)
    }
  })

  router.post('/submit-data', async (req, res) => {
    if (req.isAuthenticated()) {
      const currentBinge = await submitBite(req.user, req.body as BiteInfo, client)
      res.json(currentBinge)
    } else {
      res.sendStatus(401)
    }
  })

  return router
}

export default index
