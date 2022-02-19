import 'dotenv/config'
import { db } from './db'
import { calculateBites } from './lib'

;(async () => {
  await db()
  await calculateBites()
})()
