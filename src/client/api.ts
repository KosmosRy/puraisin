import dayjs from 'dayjs'
import { Binge, BiteInfo } from '../common/types'

const handleResponse = async <T>(res: Response): Promise<T> => {
  if (res.ok) {
    return res.json()
  } else {
    throw new Error(res.statusText)
  }
}

const handleUserState = async (res: Response): Promise<Binge> => {
  const { permillage, lastBite, bingeStart, timeTillSober } = await handleResponse<Binge>(res)

  const userStatus: Binge = { permillage, timeTillSober }

  if (lastBite) {
    userStatus.lastBite = dayjs(lastBite).toDate()
  }
  if (bingeStart) {
    userStatus.bingeStart = dayjs(bingeStart).toDate()
  }

  return userStatus
}

export const getStatus = async (): Promise<Binge> => {
  return fetch('/user-status', { cache: 'no-store', credentials: 'same-origin' }).then(
    handleUserState
  )
}

export const submitBite = async (data: BiteInfo): Promise<Binge> => {
  return fetch('/submit-data', {
    headers: new Headers({
      'Content-Type': 'application/json'
    }),
    cache: 'no-store',
    credentials: 'same-origin',
    method: 'POST',
    body: JSON.stringify(data)
  }).then(handleUserState)
}
